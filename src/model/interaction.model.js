const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    interaction: {
        type: Number,
        default: 0,
    },
});

const interactionModel = mongoose.model("Interaction", interactionSchema)

interactionModel.createCollection();

module.exports = interactionModel;