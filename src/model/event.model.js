const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({

        startAt: {
            type: Number
        },
        endAt: {
            type: Number
        },
        day: {
            type: Number
        },
        month: {
            type: Number
        },
        year: {
            type: Number
        },
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        }
})

module.exports = mongoose.model("Event", eventSchema);