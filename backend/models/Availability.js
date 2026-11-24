const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
        unique: true
    },

    workingDays: [{
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ]
    }],

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    breaks: [{
        startTime: String,
        endTime: String
    }],

    leaveDates: [{
        type: Date
    }]

}, { timestamps: true });

const Availability = mongoose.model(
    "Availability",
    availabilitySchema
);

module.exports = Availability;