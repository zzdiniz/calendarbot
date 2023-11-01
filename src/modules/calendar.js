const {google} = require('googleapis');
const moment = require("moment");

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const CALENDAR_ID = process.env.CALENDAR_ID

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({version : "v3"});
const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

const WORK_HOURS = {
    start: 8,
    end: 18,
    interval: {
        start: 12,
        end: 14,
        total: 2,
    },
    total: 8
};

moment.locale("pt-br");

require('dotenv').config();

const isDayValid = (mom) => !([0,6].includes(mom.weekday()))

const isMonthValid = (mom) => {
    let aux = mom.clone().add("3", "d").startOf("week");
    
    if (isDayValid(mom) && aux.month() != mom.month()) { return false }

    return true;
}
    
exports.insertEvent = async (event) => {

    try {
        let response = await calendar.events.insert({
            auth: auth,
            calendarId: CALENDAR_ID,
            resource: event
        });
    
        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return response;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at insertEvent --> ${error}`);
        return 0;
    }
  };

exports.getEventByDateTime = async (startDateTime,endDateTime) => {
    try {
        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDateTime, // Data e hora início
            timeMax: endDateTime, // Data e hora fim
            maxResults: 1, // Limita a resposta a 1 evento, já que é esperado apenas um evento correspondente
            timeZone: 'America/Sao_Paulo'
        });

        if (response.data.items.length > 0) {
            // Retorna o primeiro evento correspondente encontrado
            return response.data.items[0];
        } else {
            return null; // Retorna null se nenhum evento correspondente for encontrado
        }
    } catch (error) {
        console.log(`Error at getEventByDateTime --> ${error}`);
        return null; // Retorna null em caso de erro
    }
};
exports.getBusySchedules = async (startDateTime,endDateTime) =>{
    try {
        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDateTime, // Data e hora início
            timeMax: endDateTime, // Data e hora fim
            timeZone: 'America/Sao_Paulo'
        });

        if (response.data.items.length > 0) {
            // Retorna o primeiro evento correspondente encontrado
            return response.data.items;
        } else {
            return null; // Retorna null se nenhum evento correspondente for encontrado
        }
    } catch (error) {
        console.log(`Error at getEventByDateTime --> ${error}`);
        return null; // Retorna null em caso de erro
    }
}
const getDisponibilityMonthAPI = async (mom) => {
    if (!isMonthValid(mom)) {
        console.warn('Mês Inválido ' + mom.month());
        return [];
    }

    console.log(`startTime: ${ mom.clone().startOf("month").hour(WORK_HOURS.start).startOf("hour").utc().format()}`)
    console.log(`endTime: ${ mom.clone().endOf("month").hour(WORK_HOURS.start).startOf("hour").utc().format()}`)

    const request = {
        auth:auth,
        resource: {
            timeMin: mom.clone().startOf("month").hour(WORK_HOURS.start).startOf("hour").utc().format(),
            timeMax: mom.clone().endOf("month").hour(WORK_HOURS.end).startOf("hour").utc().format(),
            timeZone: "America/Sao_Paulo",
            items: [
                {
                    id: CALENDAR_ID
                }
            ]
        }
    }
    let response;
    try {
        response = await calendar.freebusy.query(request);
    } catch (err) {
        console.error('The API returned an error: ' + err);
        return;
    } finally {
        const busyTimes = response
            .data
            .calendars[CALENDAR_ID]
            .busy
            .filter(obj => isDayValid(moment(obj.start)))
            .map(obj => {
                let start = moment(obj.start)
                console.log(start.format("LLL"))
                return start
            });
        
        const freeTimes = [];

        for (let day = 1; day <= mom.daysInMonth(); day++) {
            let aux = mom.clone().date(day);
            for(let hora = WORK_HOURS.start; hora < WORK_HOURS.end; hora++) {
                aux.hour(hora).startOf("hour");
                let isManha = hora >= WORK_HOURS.start && hora < WORK_HOURS.interval.start
                let isTarde = hora >= WORK_HOURS.interval.end && hora < WORK_HOURS.end
                if ((isManha || isTarde) && busyTimes.includes(aux)) { continue }
                let free = moment(aux).hour(hora)
                console.log("Free: "+free.format("LLL"))
                freeTimes.push(free);

            }

        }
        return freeTimes;
    }
}
exports.getDisponibilityMonthAPI = getDisponibilityMonthAPI
/* const getDisponibilityMonth = async (mom) => {
    const monthDays = mom.daysInMonth();
    const freeDays = [];
    let day = mom.month() == moment().month() ? mom.date() : 1; 
    for (day; day <= monthDays; day++) {
        let freeHoursInfo = await getDisponibilityDay(mom.date(day));
        console.log("FreeHoursInfo: "+freeHoursInfo)
        if (freeHoursInfo.length == 0) { continue };
        freeDays.push({
            day: day,
            freeHours: freeHoursInfo
        })
    }

    return freeDays;
} */

/* const getDisponibilityInRangeOfMonths = async (maxFromNow) => {
    let max = maxFromNow + 1;
    const monthsAvailable = [];
    for (let i = 0; i < max; i++) {
        
        let freeDaysInfo = await getDisponibilityMonth(moment().add(`${i}`, "months"));

        if (freeDaysInfo.length == 0) { 
            max++; 
            continue;
        }
        monthsAvailable.push({
            month: moment().month(),
            freeDays: freeDaysInfo,
        })
    }
} */

/* exports.getDisponibilityInRangeOfMonths = getDisponibilityInRangeOfMonths; */