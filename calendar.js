const {google} = require('googleapis');
require('dotenv').config();

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const CALENDAR_ID = process.env.CALENDAR_ID

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({version : "v3"});
const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

const insertEvent = async (event) => {

    try {
        let response = await calendar.events.insert({
            auth: auth,
            calendarId: CALENDAR_ID,
            resource: event
        });
    
        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return response;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at insertEvent --> ${error}`);
        return 0;
    }
  };
  const getEventByDateTime = async (startDateTime,endDateTime) => {
    try {
        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDateTime, // Data e hora início
            timeMax: endDateTime, // Data e hora fim
            maxResults: 1, // Limita a resposta a 1 evento, já que é esperado apenas um evento correspondente
            timeZone: 'America/Sao_Paulo'
        });

        if (response.data.items.length > 0) {
            // Retorna o primeiro evento correspondente encontrado
            return response.data.items[0];
        } else {
            return null; // Retorna null se nenhum evento correspondente for encontrado
        }
    } catch (error) {
        console.log(`Error at getEventByDateTime --> ${error}`);
        return null; // Retorna null em caso de erro
    }
};

  module.exports = {insertEvent, getEventByDateTime}