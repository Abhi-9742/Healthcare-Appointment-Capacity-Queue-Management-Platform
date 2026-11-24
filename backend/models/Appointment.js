const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },

    appointmentDate: {
        type: Date,
        required: true
    },

    timeSlot: {
        type: String,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        enum: ["Normal", "High", "Emergency"],
        default: "Normal"
    },

    status: {
        type: String,
        enum: ["Booked", "Completed", "Cancelled", "Missed"],
        default: "Booked"
    },

    cancellationReason: {
        type: String,
        default: ""
    },
    rescheduledFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null
    }

}, { timestamps: true });

appointmentSchema.index(
    {
        doctor: 1,
        appointmentDate: 1,
        timeSlot: 1
    },
    { unique: true }
);

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

module.exports = Appointment;