const Event = require("../model/event.model")
const moment = require('moment-timezone')

const notificateUsers = (bot) =>{
    setInterval(async()=>{
        const currentDate = moment().tz('America/Sao_Paulo')
        const notification = 'Olá, parece que seu atendimento está marcado para amanhã!Estamos ansiosos para te conhecer, caso deseje cancelar a consulta digite "/cancel" '
        try {
            const events = await Event.find({});
            console.log("Eventos recuperados:", events);
            events.forEach((event) =>{
                //console.log(`event: ${event},current date ${currentDate}, db date ${dbDate},diff ${currentDate.diff(dbDate,'hours')}`)
                //recupera apenas a data cadastrada no bd
                const dbDate = moment(event.date).tz('America/Sao_Paulo')
                if(currentDate.diff(dbDate, 'hours') >= -24 && currentDate.diff(dbDate, 'hours') <= 0){
                    const chatId = event.chatId
                    bot.sendMessage(chatId,notification)
                }
            })
          } catch (err) {
            console.error("Erro ao recuperar eventos:", err);
          }
    },86400000)
    //86400000 milisegundos = 24 horas
}

module.exports = {notificateUsers}