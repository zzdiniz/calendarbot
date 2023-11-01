const mongoose = require('mongoose')

const url = 'mongodb://mongo:Cfg616DDE25fgfbB3hh-a-c-HfAEFAB4@viaduct.proxy.rlwy.net:40995'

// Defina um modelo (schema) para sua coleção.
const Schema = mongoose.Schema;
const eventSchema = new Schema({
    summary: String,
    startDate: String
});
const eventModel = mongoose.model('Exemplo', eventSchema);
const insertEventOnDB = async (event)=>{
    try {
        // Conecte-se ao banco de dados MongoDB.
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    
        console.log('Conectado ao banco de dados MongoDB');
    
        // Crie um novo registro.
        const novoRegistro = new eventModel({
          summary: `${event.summary}`,
          startDate: `${event.start.dateTime}`,
        });
    
        // Salve o registro no banco de dados.
        await novoRegistro.save();
    
        console.log('Registro inserido com sucesso:', novoRegistro);
      } catch (error) {
        console.error('Erro ao conectar e inserir registro:', error);
      } finally {
        // Feche a conexão.
        mongoose.connection.close();
        console.log('Conexão fechada.');
      }
}


// Chame a função para conectar e inserir o registro.
module.exports  = {insertEventOnDB}
