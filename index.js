const TelegramBot = require('node-telegram-bot-api');
const calendar = require('./calendar')
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

////////////////////////////////////////////////////////////////////////////
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Olá! Sou seu bot de agendamento, por favor insira uma data em que deseja agendar sua consulta no formato dia/mês.');
  } else {
    const date = messageText.split('/')
    const startDateTime = `2023-${date[1]}-${date[0]}T03:00:00.000Z`
    const endDateTime = `2023-${date[1]}-${date[0]}T04:00:00.000Z`
    const event = {
      'summary': 'Teste criando evento via bot',
      'description': `This is the description.`,
      'start': {
          'dateTime': startDateTime,
          'timeZone': 'America/Sao_Paulo',
      },
      'end': {
          'dateTime': endDateTime,
          'timeZone': 'America/Sao_Paulo',
      },
    }
    calendar.getEventByDateTime(startDateTime,endDateTime).then(
      response =>{
        const dateAlreadyExists = (response !== null && response !== undefined)? true : false
        if(dateAlreadyExists){
          bot.sendMessage(chatId, 'Infelizmente essa data já está ocupada, por favor escolha outra');
          return
        }
        else{
          calendar.insertEvent(event).then(response =>{
            if( response.status === 200){
              bot.sendMessage(chatId, `Pronto! Você tem uma consulta marcada para o dia ${date[0]}/${date[1]}.`);
            }
          })
        }
      }
    )
  }
});
