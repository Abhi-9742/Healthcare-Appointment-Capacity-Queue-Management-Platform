 
const express = require("express");

const router = express.Router();

const {
    addPatient,
    getPatients,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

// POST API
router.post("/add", addPatient);

// GET API
router.get("/", getPatients);

// PUT API
router.put("/:id", updatePatient);

// DELETE API
router.delete("/:id", deletePatient);

module.exports = router;
