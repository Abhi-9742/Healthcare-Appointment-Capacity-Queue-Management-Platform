const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        enum: [
            "Patient",
            "Doctor",
            "Department",
            "Availability",
            "Appointment",
            "Queue"
        ],
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    performedBy: {
        type: String,
        default: "System"
    }
}, { timestamps: true });

const Audit = mongoose.model("Audit", auditSchema);

module.exports = Audit;