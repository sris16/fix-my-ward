const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: ["Road", "Water", "Surroundings"]
    },

    description: {
        type: String,
        required: true
    },

    locationText: {
        type: String
    },

    lat: {
        type: Number,
        required: true
    },

    lng: {
        type: Number,
        required: true
    },

    photos: [
        {
            type: String
        }
    ],

    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "In Progress", "Resolved"]
    },

    priority: {
        type: String,
        default: "Normal",
        enum: ["Low", "Normal", "High"]
    },

    department: {
        type: String,
        default: null
    },

    verified: {
        type: Boolean,
        default: false
    },

    citizen: {
        name: String,
        mobile: String
    },

    upvotes: [
        {
            type: String
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Issue", issueSchema);