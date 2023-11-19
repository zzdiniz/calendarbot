const mongoose = require("mongoose");
const validators = require("../modules/validators")

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    email: {
        type: String,
        // default: "email@email.com",
        /* validate: {
            validator: validators.valid_email,
            message: validators.invalidInsertMessage
        } */
    },
    cpf: {
        type: String,
        // default: "12345678910",
        /* validate: {
            validator: validators.valid_cpf,
            message: validators.invalidInsertMessage
        } */
    },
    telefone: {
        type: String,
        // default: "0000000000",
        /* validate: {
            validator: validators.valid_telefone,
            message: validators.invalidInsertMessage
        } */
    },
    chatId: {
        type: String,
    },
    active: {
        type: Boolean,
        default: false
    }
})

const userModel = mongoose.model("User", userSchema);

userModel.createCollection()

module.exports = userModel;