
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const Queue = require("../models/Queue");

// Helper: Generate available 30-minute slots
const generateSlots = async (doctorId, date) => {

    const availability = await Availability.findOne({
        doctor: doctorId
    });

    if (!availability) {
        throw new Error("Doctor Availability Not Found");
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid Appointment Date");
    }

    // Check working day
    const day = selectedDate.toLocaleDateString("en-US", {
        weekday: "long"
    });

    if (!availability.workingDays.includes(day)) {
        return [];
    }

    // Check doctor leave dates
    const onLeave = availability.leaveDates.some(
        leave => leave.toISOString().slice(0, 10) === date
    );

    if (onLeave) {
        return [];
    }

    const toMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const start = toMinutes(availability.startTime);
    const end = toMinutes(availability.endTime);

    // Find existing appointments for this day
    const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: selectedDate,
        status: "Booked"
    });

    const bookedSlots = appointments.map(
        appointment => appointment.timeSlot
    );

    const slots = [];

    // Generate 30-minute slots
    for (let time = start; time + 30 <= end; time += 30) {

        const slotStart = time;
        const slotEnd = time + 30;

        // Check whether slot overlaps with a break
        const overlapsBreak = availability.breaks.some(breakTime => {
            const breakStart = toMinutes(breakTime.startTime);
            const breakEnd = toMinutes(breakTime.endTime);

            return slotStart < breakEnd && slotEnd > breakStart;
        });

        const hours = String(Math.floor(time / 60)).padStart(2, "0");
        const minutes = String(time % 60).padStart(2, "0");

        const slot = `${hours}:${minutes}`;

        if (!overlapsBreak && !bookedSlots.includes(slot)) {
            slots.push(slot);
        }
    }

    return slots;
};


// 1. Get Available Slots
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Please provide appointment date"
            });
        }

        const slots = await generateSlots(doctorId, date);

        res.status(200).json({
            message: "Available Slots",
            slots
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


// 2. Book Appointment
const bookAppointment = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            department,
            appointmentDate,
            timeSlot,
            reason,
            priority
        } = req.body;

        const slots = await generateSlots(doctor, appointmentDate);

        if (!slots.includes(timeSlot)) {
            return res.status(409).json({
                message: "This appointment slot is not available"
            });
        }

        const appointment = new Appointment({
            patient,
            doctor,
            department,
            appointmentDate: new Date(`${appointmentDate}T00:00:00`),
            timeSlot,
            reason,
            priority
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment Booked Successfully",
            appointment
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This slot has already been booked"
            });
        }

        res.status(400).json({
            message: "Error Booking Appointment",
            error: error.message
        });
    }
};


// 3. Get All Appointments
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patient")
            .populate("doctor")
            .populate("department")
            .sort({ appointmentDate: 1 });

        res.status(200).json({ appointments });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cancel Appointment
const cancelAppointment = async (req, res) => {
    try {
        const { reason } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.status !== "Booked") {
            return res.status(400).json({
                message: "Only booked appointments can be cancelled"
            });
        }

        appointment.status = "Cancelled";
        appointment.cancellationReason = reason || "Not specified";

        await appointment.save();

        // Remove the patient's waiting queue entry
        await Queue.findOneAndUpdate(
            { appointment: appointment._id },
            { status: "Skipped" }
        );

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: "Error cancelling appointment",
            error: error.message
        });
    }
};


// 5. Reschedule Appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentDate, timeSlot } = req.body;

        const oldAppointment = await Appointment.findById(req.params.id);

        if (!oldAppointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (oldAppointment.status !== "Booked") {
            return res.status(400).json({
                message: "Only booked appointments can be rescheduled"
            });
        }

        // Check whether the requested slot is available
        const slots = await generateSlots(
            oldAppointment.doctor,
            appointmentDate
        );

        if (!slots.includes(timeSlot)) {
            return res.status(409).json({
                message: "Selected time slot is not available"
            });
        }

        // Create a new appointment with the updated date and time
        const newAppointment = new Appointment({
            patient: oldAppointment.patient,
            doctor: oldAppointment.doctor,
            department: oldAppointment.department,
            appointmentDate: new Date(`${appointmentDate}T00:00:00`),
            timeSlot,
            reason: oldAppointment.reason,
            priority: oldAppointment.priority,
            rescheduledFrom: oldAppointment._id
        });

        await newAppointment.save();

        // Cancel the original appointment
        oldAppointment.status = "Cancelled";
        oldAppointment.cancellationReason = "Rescheduled";
        await oldAppointment.save();

        // Update old queue entry
        await Queue.findOneAndUpdate(
            { appointment: oldAppointment._id },
            { status: "Skipped" }
        );

        res.status(201).json({
            message: "Appointment rescheduled successfully",
            oldAppointment,
            newAppointment
        });

    } catch (error) {
        res.status(500).json({
            message: "Error rescheduling appointment",
            error: error.message
        });
    }
};

// 6. Get Patient Appointment History
const getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        const history = await Appointment.find({
            patient: patientId,
            status: {
                $in: ["Completed", "Cancelled", "Missed"]
            }
        })
        .populate("doctor")
        .populate("department")
        .sort({ appointmentDate: -1 });

        res.status(200).json({
            message: "Patient appointment history",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching appointment history",
            error: error.message
        });
    }
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
    getAppointments,
    cancelAppointment,
    rescheduleAppointment,
    getPatientHistory
};
