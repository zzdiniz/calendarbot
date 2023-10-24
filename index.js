const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
console.log(TELEGRAM_BOT_TOKEN);
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Olá! Este é o bot do Bruno.');
  } else {
    bot.sendMessage(chatId, 'Você disse: ' + messageText);
  }
});
