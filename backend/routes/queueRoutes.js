const express = require("express");
const router = express.Router();

const {
    addToQueue,
    getDoctorQueue,
    updateQueueStatus
} = require("../controllers/QueueController");

// Add patient to queue
router.post("/add", addToQueue);

// Get queue for a particular doctor and date
router.get("/:doctorId", getDoctorQueue);

// Update queue status
router.put("/update/:id", updateQueueStatus);

module.exports = router;