
const Patient = require("../models/Patient");

// Register patient
const addPatient = async (req, res) => {

    try {

        const { name, age, gender, contact, email, address } = req.body;

        const patient = new Patient({
            name,
            age,
            gender,
            contact,
            email,
            address
        });

        await patient.save();

        res.status(201).json({
            message: "Patient Registered Successfully",
            patient: patient
        });

    }
    catch (error) {

        res.status(500).json({
            message: "Error Registering Patient",
            error: error.message
        });

    }
};


// Get all patients
const getPatients = async (req, res) => {

    try {

        const patients = await Patient.find();

        res.status(200).json(patients);

    }
    catch (error) {

        res.status(500).json({
            message: "Error Fetching Patients",
            error: error.message
        });

    }
};


//Update patients details
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient Not Found"
            });
        }

        res.status(200).json({
            message: "Patient Updated Successfully",
            patient: patient
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Updating Patient",
            error: error.message
        });
    }
};

// delete patient 
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient Not Found"
            });
        }

        res.status(200).json({
            message: "Patient Deleted Successfully",
            patient: patient
        });

    } catch (error) {
        res.status(400).json({
            message: "Error Deleting Patient",
            error: error.message
        });
    }
};
module.exports = {
    addPatient,
    getPatients,
    updatePatient,
    deletePatient
};
