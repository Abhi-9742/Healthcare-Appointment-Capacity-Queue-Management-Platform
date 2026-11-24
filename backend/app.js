const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");

const doctorRoutes = require("./routes/doctorRoutes");

const departmentRoutes = require("./routes/departmentRoutes");

const availabilityRoutes = require("./routes/availabilityRoutes");

const appointmentRoutes = require("./routes/appointmentRoutes");

const queueRoutes = require("./routes/queueRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const auditRoutes = require("./routes/auditRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Check incoming requests
app.use((req, res, next) => {
    console.log("Request received:", req.method, req.url);
    next();
});

// Test API
app.get("/", (req, res) => {
    res.send("Healthcare Management Backend is Running");
});

// Patient routes
app.use("/api/patients", patientRoutes);

// Doctor routes
app.use("/api/doctors", doctorRoutes);

// Department routes
app.use("/api/departments", departmentRoutes);

// Availability routes
app.use("/api/availability", availabilityRoutes);

// Appointment routes
app.use("/api/appointments", appointmentRoutes);

// queue routes
app.use("/api/queue", queueRoutes);

//dashboard routes
app.use("/api/dashboard", dashboardRoutes);

//audit routes
app.use("/api/audit", auditRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
