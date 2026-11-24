const express = require("express");
const router = express.Router();

const {
    createAudit,
    getAuditLogs,
    getEntityAuditLogs
} = require("../controllers/auditController");

// Create audit record
router.post("/add", createAudit);

// Get all audit records
router.get("/", getAuditLogs);

// Get audit records for a specific entity
router.get("/:entityType/:entityId", getEntityAuditLogs);

module.exports = router;