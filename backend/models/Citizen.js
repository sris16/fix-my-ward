const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Citizen", citizenSchema);