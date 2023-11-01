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

const isToday = (mom, comparison = moment()) => mom.isSame(comparison, "day")

const isDayValid = (mom) => !([0,6].includes(mom.weekday()))

exports.isDayValid = isDayValid

const isMonthValid = (mom) => {
    let endOfMonth = mom.clone().endOf("month");
    let diffFromEndOfMonth = endOfMonth.diff(mom, "d");
   
    if ((!isDayValid(mom) && diffFromEndOfMonth < 3)) {
        return false;
    }
    

    if (!isDayValid(mom) && mom.clone().add(1, "day").isSame(mom, "month" )){ return false }

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
    const queryCurrentMonth = (mom) => moment().isSame(mom, "month")
    console.log("Mês"+mom.toISOString())
    const query = {
        start: queryCurrentMonth(mom) ? mom.clone().hour(WORK_HOURS.start).startOf("hour") : mom.clone().startOf("month").hour(WORK_HOURS.start).startOf("hour"),
        end: mom.clone().endOf("month").hour(WORK_HOURS.end).startOf("hour"),
    }
    
    /* if (!isMonthValid(query.start)) {
        console.warn('Mês Inválido ' + (mom.month() + 1));
        return [];
    } */



    const request = {
        auth:auth,
        resource: {
            timeMin: query.start.toISOString(),
            timeMax: query.end.toISOString(),
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
                return start
            });
        
        const freeDays = [];

        let day = queryCurrentMonth(mom) ? mom.clone().add("1", "d").date() : 1;

        for (day; day <= mom.daysInMonth(); day++) {
            
            let aux = mom.clone().date(day);
            
            if (!isDayValid(mom.clone().date(day))) { continue }

            for(let hora = WORK_HOURS.start; hora < WORK_HOURS.end; hora++) {
                
                aux.hour(hora).startOf("hour");
                
                if (isHorarioDeTrabalho(hora) && !busyTimes.some(el => aux.isSame(el))) { 
                    let free = aux.clone()
                    const pattern = {text: `${free.format('[Dia] DD')}`, callback_data: `${free.toISOString()}`};
                    freeDays.push(pattern);
                    break; 
                }
            }

        }
        return freeDays;
    }
}

exports.getDisponibilityWeekAPI = async (initialDate, finalDate) => {
    const busy = await this.getBusySchedules(moment(initialDate).toISOString(), moment(finalDate).toISOString())
    
    const busyFormated = busy!=null ? busy.map(res => moment(res.start.dateTime)) 
        .filter(day => isDayValid(moment(day)))
        : [];
        

    //time.isBetween(weekStartDate, weekEndDate, 'day', '[]')
    
    const freeDays = [];

    for (let weekDay = 0; weekDay<7; weekDay++) {
        let aux = moment(initialDate).add(weekDay, "days");
        if (!isDayValid(aux)) {continue};
        for (let hour = WORK_HOURS.start; hour < WORK_HOURS.end; hour++) {
            aux.hour(hour).startOf(hour);
            if (isHorarioDeTrabalho(hour) && !busyFormated.some(el => aux.isSame(el))) {
                let free = aux.clone()
                const pattern = {text: `${free.format('[Dia] DD/MM')}`, callback_data: `${free.toISOString()}`};
                freeDays.push(pattern);
                break;
            }
        }       
    }

    return freeDays;
}


const getDisponibilityDayAPI = async (mom) => {
    const query = {
        start: mom.clone().hour(WORK_HOURS.start).startOf("hour").utc().format(),
        end: mom.clone().hour(WORK_HOURS.end).startOf("hour").utc().format(),
    }

    const request = {
        auth:auth,
        resource: {
            timeMin: query.start,
            timeMax: query.end,
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
            .map(obj => {
                let start = moment(obj.start)
                return start
            });
        
        const freeHours = [];

        let aux = mom.clone();

        for(let hora = WORK_HOURS.start; hora < WORK_HOURS.end; hora++) {
                
            aux.hour(hora).startOf("hour")
            
            if (!isHorarioDeTrabalho(hora) || busyTimes.some(el => aux.isSame(el))) { continue }
            
            let free = aux.clone()
            
            const pattern = {text: `${free.format('HH:mm [horas]')}`, callback_data: `${aux.toISOString()}`};

            freeHours.push(pattern);
        }

        return freeHours;
    }
}

exports.getDisponibilityMonthAPI = getDisponibilityMonthAPI

exports.getDisponibilityDayAPI = getDisponibilityDayAPI

exports.showNextMonths = async (numberOfMonths) => {
    const months = []
    for (let i = 0; i < numberOfMonths; i++) {
        let aux = moment().add(i, "month");
        
        let responseDisponibilityMonths = await getDisponibilityMonthAPI(aux)
        
        if (responseDisponibilityMonths.length < 1){
            numberOfMonths++;
        } else {
            
            const pattern = {text: `${aux.format('MM/YY')}`, callback_data: aux.toISOString()};
            months.push(pattern);
        }
    }
    
    return months;
}

function isHorarioDeTrabalho(hora) {
    let isManha = hora >= WORK_HOURS.start && hora < WORK_HOURS.interval.start;
    let isTarde = hora >= WORK_HOURS.interval.end && hora < WORK_HOURS.end;
    return isManha || isTarde;
}
