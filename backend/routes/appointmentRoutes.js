const express = require("express");
const router = express.Router();

const {
    getAvailableSlots,
    bookAppointment,
    getAppointments,
    cancelAppointment,
    rescheduleAppointment,
    getPatientHistory
} = require("../controllers/appointmentController");

// Get all appointments
router.get("/", getAppointments);

// Get available slots
router.get("/slots/:doctorId", getAvailableSlots);

// Book appointment
router.post("/book", bookAppointment);

// Cancel appointment
router.put("/cancel/:id", cancelAppointment);

// Reschedule appointment
router.put("/reschedule/:id", rescheduleAppointment);

// Get patient appointment history
router.get("/history/:patientId", getPatientHistory);

module.exports = router;