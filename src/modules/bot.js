const TelegramBot = require('node-telegram-bot-api');

const calendar = require("./calendar")
const chatRouter = require("./chat-router");

const auth = require("./auth")

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

////////////////////////////////////////////////////////////////////////////
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const {userID, interactionId, interactionNum} = await auth.login(chatId);
    const debug = false;

    // await calendar.getDisponibilityInRangeOfMonths(1);
    
    if (messageText === "/start") {
      chatRouter.changeInteraction(interactionId, interactionNum, -interactionNum);
      return chatRouter.start(bot, chatId, messageText);
    }
    
    console.log("Mensagem: "+messageText);
    
    let jumpTo = +1, response;
    
    switch (interactionNum) {
      case 0:
        response = await chatRouter.cadastraUsuario_cpf(bot, chatId, messageText, userID);
        if (response === false) { jumpTo = +4 };
        break;
      case 1:
        response = await chatRouter.cadastraUsuario_nome(bot, chatId, messageText, userID);
        break;
      case 2:
        response = await chatRouter.cadastraUsuario_email(bot, chatId, messageText, userID);
        break;
      case 3:
        response = await chatRouter.cadastraUsuario_telefone(bot, chatId, messageText, userID);
        break;
      case 4:
        response = await chatRouter.selecionaMeses(bot, chatId, messageText, userID, 2000)
    }
    if (response === undefined) { jumpTo = 0 };
    
    chatRouter.changeInteraction(interactionId, interactionNum, jumpTo);
    
    if (debug) {
      console.log("userID:\n\t"+userID+"\ninteractionID:\n\t"+interactionId+"\ninteractionNum\n\t"+interactionNum)
      // await chatRouter.changeInteraction(interactionId, interactionNum, +1);
      // bot.sendMessage(chatId, messageText)
    }
        
        
        
        
        /* if (messageText === '/start') {
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
              db.insertEventOnDB(event)
            }
          })
        }
      }
    )
  } */
});

module.exports = bot;