const Event = require("../model/event.model")
const User = require("../model/event.model")
const moment = require("moment-timezone")
const { getBusySchedules} = require("./calendar")

const getAvailableSchedules = async () =>{
    const startDateTime = moment('2023-10-01T00:00:00Z')
    const endDateTime = moment('2023-10-31T00:00:00Z')
    const busySchedules = await getBusySchedules(startDateTime.toISOString(), endDateTime.toISOString())
    const startDateTimeConverted = startDateTime.tz('America/Sao_Paulo')
    const endDateTimeConverted = endDateTime.tz('America/Sao_Paulo')

    const availableSchedules = []
    //popula availableSchedules com todas as datas possíveis entre 8 e 18h
    while(startDateTimeConverted <= endDateTimeConverted){
        if(startDateTimeConverted.hour() >= 8 && startDateTimeConverted.hour() <=18){
            availableSchedules.push(moment(startDateTimeConverted))
        }
        startDateTimeConverted.add(1,'hour')
    }

    const unbusySchedules = availableSchedules.filter(availableDate => {
        return !busySchedules.some(busyDate => {
            return moment(busyDate.start.dateTime).isSame(availableDate);
        });
    });
    console.log("unbusySchedules",unbusySchedules)    
}
module.exports = {getAvailableSchedules}


/* const isMonthValid = (date) => {
    let aux = date.clone().add("3", "d").startOf("week");
    
    if ([0,5,6].includes(date.weekday()) && aux.month() != date.month()) {
        return false
    }

    return true;
}



exports.disponibleMonth = async (year, max) => {
    
    

}

exports.disponibleWeeks = (month) => {
    
}

exports.disponibleDays = (week) => {

}

exports.disponibleHours = (day) => {
    let date = moment().day(day)

    if (anoAtual > date.year()) { return false }
    else if (anoAtual > date.year()) { date.year(year).startOf("Y") };

    let i = isMonthValid(date) ? 0 : 1;
    
    for (i; i<max; i++) {
        let daysInMonth = date.clone().add(1, "M").daysInMonth();
        
        let await Event.find({month: date.month(), year: date.year()}).distinct("day")

    }
}
 */