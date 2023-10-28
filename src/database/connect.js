const mongoose = require("mongoose");

const connect = async () => {
    try {
        await mongoose.connect('mongodb+srv://admin:YWMROBtKcIbJALvd@main.trogatv.mongodb.net/?retryWrites=true&w=majority')
        console.log("Mongoose Conectado");
    } catch (error) {
        console.log("Ocorreu um erro");
        console.error(error.message);
    }
}

module.exports = connect();
