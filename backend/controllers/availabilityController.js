const Availability = require("../models/Availability");

// 1. Set Doctor Availability
const setAvailability = async (req, res) => {
    try {
        const { doctor, workingDays, startTime, endTime, breaks, leaveDates } = req.body;

        const availability = await Availability.findOneAndUpdate(
            { doctor: doctor },
            {
                doctor,
                workingDays,
                startTime,
                endTime,
                breaks,
                leaveDates
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: "Doctor Availability Saved Successfully",
            availability
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Saving Availability",
            error: error.message
        });
    }
};

// 2. Get Doctor Availability
const getAvailability = async (req, res) => {
    try {
        const availability = await Availability.findOne({
            doctor: req.params.doctorId
        }).populate("doctor");

        if (!availability) {
            return res.status(404).json({
                message: "Availability Not Found"
            });
        }

        res.status(200).json(availability);

    } catch (error) {
        res.status(400).json({
            message: "Error Fetching Availability",
            error: error.message
        });
    }
};

module.exports = {
    setAvailability,
    getAvailability
};