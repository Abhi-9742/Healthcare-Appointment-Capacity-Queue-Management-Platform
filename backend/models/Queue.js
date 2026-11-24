const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        unique: true
    },
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
    appointmentDate: {
        type: Date,
        required: true
    },
    queueNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Waiting", "In Progress", "Completed", "Skipped"],
        default: "Waiting"
    }
}, { timestamps: true });

const Queue = mongoose.model("Queue", queueSchema);

module.exports = Queue;