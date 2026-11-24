const express = require("express");
const router = express.Router();

const {
    setAvailability,
    getAvailability
} = require("../controllers/availabilityController");

router.post("/set", setAvailability);

router.get("/:doctorId", getAvailability);

module.exports = router;