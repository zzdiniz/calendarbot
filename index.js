const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = '6889459375:AAFrmLelhsjUjH8GJWaADOBvtrTvBmH80VQ';
console.log(token);
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Olá! Este é o bot do Bruno.');
  } else {
    bot.sendMessage(chatId, 'Você disse: ' + messageText);
  }
});
