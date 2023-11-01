const auth = require("./auth");
const ChatRouter = require("./chat-router");
const config = require("../../config/config")
const TelegramBot = require('node-telegram-bot-api');

const { notificateUsers } = require('./notifications');
const { getAvailableSchedules } = require('./events');


const TELEGRAM_BOT_TOKEN = '6709653999:AAHkNF1g9y_2jLccfM_uXOnM6MUkiI9UzsY';
//const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

////////////////////////////////////////////////////////////////////////////
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

notificateUsers(bot)
// getAvailableSchedules()

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const {userID, interactionId, interactionNum} = await auth.login(chatId);
    
    if (messageText === "/start") {
      await ChatRouter.changeInteraction(interactionId, 0);
      return ChatRouter.start(bot, chatId, messageText);
    }
    
    switch (interactionNum) {
      case 0:
        await ChatRouter.cadastraUsuario_cpf(messageText, userID)
          .then(async res =>{ 
            if (res.status == 'logged') {
              bot.sendMessage(chatId, res.message);
              await ChatRouter.changeInteraction(interactionId, 5)
              bot.sendMessage(chatId, "Selecione um dos seguintes meses:", await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths));
            } else if (res.status == "signin") {
              bot.sendMessage(chatId, res.message);
              ChatRouter.changeInteraction(interactionId, 1)
            }
          }).catch(err => bot.sendMessage(chatId, err.message))
        break;
      case 1:
        await ChatRouter.cadastraUsuario_nome(messageText, userID)
          .then(async res => {
            bot.sendMessage(chatId, res)
            await ChatRouter.changeInteraction(interactionId, 2)
          }).catch(err => bot.sendMessage(chatId, err.message))
          break;
      case 2:
        await ChatRouter.cadastraUsuario_email(messageText, userID)
          .then(async res =>{ 
             if (res != undefined) {
              bot.sendMessage(chatId, res);
              await ChatRouter.changeInteraction(interactionId, 3)
            }
          }).catch(err => bot.sendMessage(chatId, err.message))
        break;
      case 3:
        await ChatRouter.cadastraUsuario_telefone(messageText, userID)
          .then(async res => {
            if (res != undefined) {
              await ChatRouter.changeInteraction(interactionId, 4)
              setTimeout(_ => {
                bot.sendMessage(chatId, "Vamos marcar uma consulta!")
              }, 100);
              await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths)
                .then( options => bot.sendMessage(chatId, "Selecione um dos seguintes meses:", options))
                .catch(err => console.log(err.message))
            }
          }).catch(err=>bot.sendMessage(chatId, err.message));
        break;
      case 4:
        setTimeout(_ => {
          bot.sendMessage(chatId, "Vamos marcar uma consulta!")
        }, 100);
        await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths)
          .then( options => bot.sendMessage(chatId, "Selecione um dos seguintes meses:", options))
          .catch(err => console.log(err.message))
        break;
      default:
        // await ChatRouter.sendDisponibleMonths(bot, chatId, messageText,config.numberOfNextMonths);
        bot.sendMessage(chatId, "Ocorreu um erro, envie /start para recomeçar!")
        break;
    }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const responseData = query.data;
  let {userID, interactionId, interactionNum} = await auth.login(chatId);
    try {
      if (responseData == -1 && interactionNum > 4) {
        await ChatRouter.changeInteraction(interactionId, --interactionNum);
      } else if (responseData != -1) {
        await ChatRouter.changeInteraction(interactionId, ++interactionNum);
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      switch (interactionNum) {
        default:
          bot.sendMessage(chatId, "Ocorreu um erro, envie /start para recomeçar!")
          break;
        case 4:
          await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths)
            .then(options => bot.sendMessage(chatId, "Selecione um dos seguintes meses:", options))
            .catch(err => console.log(err.message))
          break;
        case 5:
          await ChatRouter.sendDisponibleWeeks(responseData)
            .then(options => bot.sendMessage(chatId, "Selecione uma das seguintes semanas:", options))
            .catch(err => console.log(err.message))
          break;
        case 6:
          await ChatRouter.sendDisponibleDaysInWeek(responseData)
            .then(options => bot.sendMessage(chatId, "Selecione um dos seguintes dias:", options))
            .catch(err => console.log(err.message))
          break;
        case 7:
          await ChatRouter.sendDisponibleHoursinDay(responseData)
            .then(options => bot.sendMessage(chatId, "Selecione um dos seguintes horários:", options))
            .catch(err => console.log(err.message))
          break;
        case 8:
          await ChatRouter.setAppointment(userID, responseData)
            .then(res => responseRouter = res)
            .catch(err => console.log(err.message))
          break;
      }
    }

})

module.exports = bot;