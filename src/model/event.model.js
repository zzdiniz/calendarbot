const mongoose = require("mongoose");
const { invalidInsertMessage, validDate } = require("../modules/validators");

const eventSchema = new mongoose.Schema({

        date: {
            type: Date,
            unique: true,
            required: true,
            validate: {
                validator: validDate,
                message: invalidInsertMessage
            }
        },
        chatId:{
            type: String
        },
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        }
})

module.exports = mongoose.model("Event", eventSchema);