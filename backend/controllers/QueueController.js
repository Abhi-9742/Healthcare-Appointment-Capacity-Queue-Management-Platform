const Queue = require("../models/Queue");
const Appointment = require("../models/Appointment");

// 1. Add appointment to the queue
const addToQueue = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.status !== "Booked") {
            return res.status(400).json({
                message: "Only booked appointments can enter the queue"
            });
        }

        const existingQueue = await Queue.findOne({ appointment: appointmentId });

        if (existingQueue) {
            return res.status(409).json({
                message: "Appointment already exists in the queue"
            });
        }

        // Find the last queue number for this doctor and date
        const lastPatient = await Queue.findOne({
            doctor: appointment.doctor,
            appointmentDate: appointment.appointmentDate
        }).sort({ queueNumber: -1 });

        const queueNumber = lastPatient ? lastPatient.queueNumber + 1 : 1;

        const queueEntry = new Queue({
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            appointmentDate: appointment.appointmentDate,
            queueNumber
        });

        await queueEntry.save();

        res.status(201).json({
            message: "Patient added to queue successfully",
            queueEntry
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding patient to queue",
            error: error.message
        });
    }
};


// 2. Get queue for a doctor on a particular date
const getDoctorQueue = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Please provide a date"
            });
        }

        const startDate = new Date(`${date}T00:00:00`);
        const endDate = new Date(`${date}T23:59:59.999`);

        const queue = await Queue.find({
            doctor: doctorId,
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .populate("patient")
        .populate("doctor")
        .populate("appointment")
        .sort({ queueNumber: 1 });

        res.status(200).json(queue);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching queue",
            error: error.message
        });
    }
};


// 3. Update queue status
const updateQueueStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Waiting",
            "In Progress",
            "Completed",
            "Skipped"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid queue status"
            });
        }

        const queueEntry = await Queue.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!queueEntry) {
            return res.status(404).json({
                message: "Queue entry not found"
            });
        }

        // When consultation is completed, update appointment status too
        if (status === "Completed") {
            await Appointment.findByIdAndUpdate(
                queueEntry.appointment,
                { status: "Completed" }
            );
        } else if (status === "Waiting" || status === "In Progress") {
            await Appointment.findByIdAndUpdate(
                queueEntry.appointment,
                { status: "Booked" }
            );
        }

        res.status(200).json({
            message: "Queue status updated successfully",
            queueEntry
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating queue status",
            error: error.message
        });
    }
};


module.exports = {
    addToQueue,
    getDoctorQueue,
    updateQueueStatus
};