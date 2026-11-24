const Doctor = require("../models/Doctor");

// 1. Add Doctor
const addDoctor = async (req, res) => {
    try {
        const { name, specialization, contact, email } = req.body;

        const doctor = new Doctor({
            name,
            specialization,
            contact,
            email
        });

        await doctor.save();

        res.status(201).json({
            message: "Doctor Added Successfully",
            doctor: doctor
        });

    } catch (error) {
        res.status(500).json({
            message: "Error Adding Doctor",
            error: error.message
        });
    }
};

// 2. Get All Doctors
const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();

        res.status(200).json(doctors);

    } catch (error) {
        res.status(500).json({
            message: "Error Fetching Doctors",
            error: error.message
        });
    }
};

// 3. Update Doctor
const updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor Not Found"
            });
        }

        res.status(200).json({
            message: "Doctor Updated Successfully",
            doctor: doctor
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Updating Doctor",
            error: error.message
        });
    }
};

// 4. Delete Doctor
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor Not Found"
            });
        }

        res.status(200).json({
            message: "Doctor Deleted Successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Deleting Doctor",
            error: error.message
        });
    }
};

module.exports = {
    addDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor
};