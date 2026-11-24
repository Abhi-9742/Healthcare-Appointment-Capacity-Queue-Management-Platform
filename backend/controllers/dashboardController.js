const Appointment = require("../models/Appointment");
const Queue = require("../models/Queue");

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get today's date
        const today = new Date();

        const startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        // Get today's appointments
        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate("department");

        // Count appointments by status
        const totalAppointments = appointments.length;

        const completedAppointments = appointments.filter(
            a => a.status === "Completed"
        ).length;

        const cancelledAppointments = appointments.filter(
            a => a.status === "Cancelled"
        ).length;

        const missedAppointments = appointments.filter(
            a => a.status === "Missed"
        ).length;

        const bookedAppointments = appointments.filter(
            a => a.status === "Booked"
        ).length;

        // Get today's waiting queue
        const waitingQueue = await Queue.countDocuments({
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            },
            status: "Waiting"
        });

        // Calculate department workload
        const departmentWorkload = {};

        appointments.forEach(appointment => {
            if (
                appointment.status === "Cancelled" ||
                appointment.status === "Missed"
            ) {
                return;
            }
        
            const departmentName = appointment.department?.name || "Unknown";
        
            departmentWorkload[departmentName] =
                (departmentWorkload[departmentName] || 0) + 1;
        });

        res.status(200).json({
            message: "Dashboard Statistics",
            statistics: {
                totalAppointments,
                bookedAppointments,
                completedAppointments,
                cancelledAppointments,
                missedAppointments,
                waitingQueue
            },
            departmentWorkload
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard statistics",
            error: error.message
        });
    }
};

module.exports = { getDashboardStats };