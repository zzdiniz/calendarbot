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