const Event = require("../model/event.model")
const User = require("../model/event.model")
const moment = require("moment")

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