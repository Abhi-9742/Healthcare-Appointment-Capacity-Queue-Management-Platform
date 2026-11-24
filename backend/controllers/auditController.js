const Audit = require("../models/Audit");

// 1. Record an activity
const createAudit = async (req, res) => {
    try {
        const {
            action,
            entityType,
            entityId,
            description,
            performedBy
        } = req.body;

        const audit = new Audit({
            action,
            entityType,
            entityId,
            description,
            performedBy
        });

        await audit.save();

        res.status(201).json({
            message: "Audit record created successfully",
            audit
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating audit record",
            error: error.message
        });
    }
};


// 2. Get all audit records
const getAuditLogs = async (req, res) => {
    try {
        const logs = await Audit.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Audit records fetched successfully",
            logs
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching audit records",
            error: error.message
        });
    }
};


// 3. Get audit records for a particular entity
const getEntityAuditLogs = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;

        const logs = await Audit.find({
            entityType,
            entityId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Entity audit history fetched successfully",
            logs
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching entity audit history",
            error: error.message
        });
    }
};


module.exports = {
    createAudit,
    getAuditLogs,
    getEntityAuditLogs
};