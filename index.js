const TelegramBot = require('node-telegram-bot-api');
const calendar = require('./calendar')
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const event = {
  'summary': 'Meu evento 2',
  'start': {
      'dateTime': '2023-10-24T15:00:00',
      'timeZone': 'America/Sao_Paulo',
  },
  'end': {
      'dateTime': '2023-10-24T16:00:00',
      'timeZone': 'America/Sao_Paulo',
  },
}

calendar.insertEvent(event)
////////////////////////////////////////////////////////////////////////////
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
