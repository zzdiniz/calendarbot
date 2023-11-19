const auth = require("./auth");
const ChatRouter = require("./chat-router");
const config = require("../../config/config")
const moment = require('moment')
const TelegramBot = require('node-telegram-bot-api');

const { notificateUsers } = require('./notifications');
const { getAvailableSchedules } = require('./events');


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

////////////////////////////////////////////////////////////////////////////
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

notificateUsers(bot)
// getAvailableSchedules()

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  let {userID, interactionNum} = await auth.getActiveUserInChat(chatId);
  console.log(`userID: ${userID}| interactionNum: ${interactionNum}`)
  
  if (messageText === "/start") {
    await auth.deactiveUserInChat(chatId);
    return ChatRouter.start(bot, chatId, messageText);
  }
  if (interactionNum < 0) {
    let userData = await auth.tryLogin(chatId, messageText)
    userID = userData.id;
    if (!userData.new) {
      await ChatRouter.changeInteraction(userID, 4)
      interactionNum = 4;
      bot.sendMessage(chatId, `Bem vindo de volta ${userData.name}!`)
    } else {
      interactionNum = 0;
    };
  }
  console.log(interactionNum);
  switch (interactionNum) {
    case 0:
      await ChatRouter.cadastraUsuario_cpf(messageText, userID)
        .then(async res =>{ 
          if (res.status == 'logged') {
            bot.sendMessage(chatId, res.message);
            await ChatRouter.changeInteraction(userID, 4)
            bot.sendMessage(chatId, "Selecione um dos seguintes meses:", await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths));
          } else if (res.status == "signin") {
            bot.sendMessage(chatId, res.message);
            ChatRouter.changeInteraction(userID, 1)
          }
        }).catch(err => bot.sendMessage(chatId, err.message))
      break;
    case 1:
      await ChatRouter.cadastraUsuario_nome(messageText, userID)
        .then(async res => {
          bot.sendMessage(chatId, res)
          await ChatRouter.changeInteraction(userID, 2)
        }).catch(err => bot.sendMessage(chatId, err.message))
        break;
    case 2:
      await ChatRouter.cadastraUsuario_email(messageText, userID)
        .then(async res =>{ 
            if (res != undefined) {
            bot.sendMessage(chatId, res);
            await ChatRouter.changeInteraction(userID, 3)
          }
        }).catch(err => bot.sendMessage(chatId, err.message))
      break;
    case 3:
      await ChatRouter.cadastraUsuario_telefone(messageText, userID)
        .then(async res => {
          if (res != undefined) {
            await ChatRouter.changeInteraction(userID, 4)
            bot.sendMessage(chatId, "Cadastro concluído com sucesso!")
            setTimeout(_ => {
              bot.sendMessage(chatId, "Vamos marcar uma consulta!")
            }, 500);
            await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths)
              .then( options => bot.sendMessage(chatId, "Selecione um dos seguintes meses:", options))
              .catch(err => console.log(err.message))
          }
        }).catch(err=>bot.sendMessage(chatId, err.message));
      break;
    case 4:
      setTimeout(_ => {
        bot.sendMessage(chatId, "Vamos marcar uma consulta!")
      }, 500);
      await ChatRouter.sendDisponibleMonths(config.numberOfNextMonths)
        .then( options => bot.sendMessage(chatId, "Selecione um dos seguintes meses:", options))
        .catch(err => console.log(err.message))
      break;
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  let responseData = query.data;
  let {userID, interactionNum} = await auth.login(chatId);
  try {
    if (responseData == -1 && interactionNum > 4) {
      responseData = await ChatRouter.changeInteraction(userID, --interactionNum);
    } else if (responseData != -1) {
      await ChatRouter.changeInteraction(userID, ++interactionNum, responseData);
    }
  } catch (e) {
    console.log(e.message);
  } finally {
    console.log("InteractionNum: "+interactionNum);
    console.log("Callback_data: "+ responseData);
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
        await ChatRouter.setAppointment(userID, responseData, chatId)
          .then(res => {
            const data = moment(res.data.start.dateTime).format('LLL')
            bot.sendMessage(chatId,`Combinado! Sua consulta está marcada para ${data}. Estamos ansiosos pelo nosso encontro.`)
          })
          .catch(err => console.log(err))
        break;
    }
  }
})

module.exports = bot;