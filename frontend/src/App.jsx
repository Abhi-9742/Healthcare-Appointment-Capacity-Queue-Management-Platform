
import { useState, useEffect } from "react";

import Patients from "./components/Patients";
import Doctors from "./components/Doctors";
import Departments from "./components/Departments";
import Availability from "./components/Availability";
import Appointments from "./components/Appointments";
import AppointmentList from "./components/AppointmentList";
import QueueManagement from "./components/QueueManagement";
import Reports from "./components/Reports";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalAppointments: 0,
    booked: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
    waitingQueue: 0,
    departmentWorkload: {}
  });

  // Recent appointments
  const [appointments, setAppointments] = useState([]);

  // Queue statistics
  const [queueStats, setQueueStats] = useState({
    waiting: 0,
    inProgress: 0,
    completed: 0
  });

  const [loading, setLoading] = useState(true);

  // Sidebar menu
  const menuItems = [
    "Dashboard",
    "Patients",
    "Doctors",
    "Departments",
    "Appointments",
    "Appointment List",
    "Queue Management",
    "Availability",
    "Reports"
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Fetch dashboard statistics
      const statsResponse = await fetch(
        "http://localhost:5001/api/dashboard/stats"
      );

      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setDashboardStats({
            totalAppointments: statsData.statistics.totalAppointments,
            booked: statsData.statistics.bookedAppointments,
            completed: statsData.statistics.completedAppointments,
            cancelled: statsData.statistics.cancelledAppointments,
            missed: statsData.statistics.missedAppointments,
            waitingQueue: statsData.statistics.waitingQueue,
            departmentWorkload: statsData.departmentWorkload
        });
    }

      // Fetch appointments
      const appointmentResponse = await fetch(
        "http://localhost:5001/api/appointments"
      );

      const appointmentData = await appointmentResponse.json();

      if (appointmentResponse.ok) {
        const appointmentList = Array.isArray(appointmentData)
          ? appointmentData
          : appointmentData.appointments || [];

        // Show only today's appointments
        const today = new Date().toLocaleDateString("en-CA");

        const todaysAppointments = appointmentList.filter((item) => {
          const appointmentDate = new Date(
            item.appointmentDate
          ).toLocaleDateString("en-CA");

          return appointmentDate === today;
        });

        setAppointments(todaysAppointments.slice(0, 5));
      }

      // Fetch queue statistics
      // Queue counts are calculated from today's appointments
      const todayQueue = {
        waiting: 0,
        inProgress: 0,
        completed: 0
      };

      const doctorResponse = await fetch(
        "http://localhost:5001/api/doctors"
      );

      const doctorData = await doctorResponse.json();

      const doctorList = Array.isArray(doctorData)
        ? doctorData
        : doctorData.doctors || [];

      const today = new Date().toLocaleDateString("en-CA");

      for (const doctor of doctorList) {
        const queueResponse = await fetch(
          `http://localhost:5001/api/queue/${doctor._id}?date=${today}`
        );

        if (queueResponse.ok) {
          const queueData = await queueResponse.json();

          const queueList = Array.isArray(queueData)
            ? queueData
            : queueData.queue || [];

          queueList.forEach((item) => {
            if (item.status === "Waiting") {
              todayQueue.waiting++;
            } else if (item.status === "In Progress") {
              todayQueue.inProgress++;
            } else if (item.status === "Completed") {
              todayQueue.completed++;
            }
          });
        }
      }

      setQueueStats(todayQueue);

    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data when application opens
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dashboard statistic cards
  const stats = [
    {
      title: "Today's Appointments",
      value: dashboardStats.totalAppointments,
      icon: "📅"
    },
    {
      title: "Booked Appointments",
      value: dashboardStats.booked,
      icon: "📋"
    },
    {
      title: "Waiting Patients",
      value: dashboardStats.waitingQueue,
      icon: "⏳"
    },
    {
      title: "Completed Appointments",
      value: dashboardStats.completed,
      icon: "✅"
    }
  ];

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">

        <h2 className="logo">
          HealthCare<span>+</span>
        </h2>

        <p className="menu-heading">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activePage === item
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Healthcare Management</p>
          <small>Admin Panel</small>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="top-header">

          <div>
            <h1>{activePage}</h1>
            <p>Welcome back! Here's our hospital overview.</p>
          </div>

          <div className="admin-profile">

            <span className="notification">🔔</span>

            <div className="avatar">A</div>

            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>

          </div>

        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" ? (

          <>

            {/* Refresh Button */}
            <div className="section-header">
              <h2>Hospital Overview</h2>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh Dashboard"}
              </button>
            </div>

            {loading ? (

              <p>Loading dashboard data...</p>

            ) : (

              <>

                {/* Statistics */}
                <section className="stats-container">

                  {stats.map((stat) => (

                    <div className="stat-card" key={stat.title}>

                      <div className="stat-icon">
                        {stat.icon}
                      </div>

                      <p>{stat.title}</p>

                      <h2>{stat.value}</h2>

                    </div>

                  ))}

                </section>

                {/* Quick Actions */}
                <section className="quick-section">

                  <h2>Quick Actions</h2>

                  <div className="quick-actions">

                    <button
                      onClick={() => setActivePage("Patients")}
                    >
                      + Add Patient
                    </button>

                    <button
                      onClick={() => setActivePage("Appointments")}
                    >
                      + Book Appointment
                    </button>

                    <button
                      onClick={() => setActivePage("Doctors")}
                    >
                      + Add Doctor
                    </button>

                  </div>

                </section>

                {/* Today's Appointments */}
                <section className="appointment-section">

                  <div className="section-header">

                    <h2>Today's Appointments</h2>

                    <button
                      onClick={() => setActivePage("Appointment List")}
                    >
                      View All
                    </button>

                  </div>

                  <div className="table-wrapper">

                    <table>

                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Department</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>

                        {appointments.length > 0 ? (

                          appointments.map((appointment) => (

                            <tr key={appointment._id}>

                              <td>
                                {appointment.patient?.name || "N/A"}
                              </td>

                              <td>
                                {appointment.doctor?.name || "N/A"}
                              </td>

                              <td>
                                {appointment.department?.name || "N/A"}
                              </td>

                              <td>
                                {appointment.timeSlot}
                              </td>

                              <td>
                                <span
                                  className={`status ${appointment.status?.toLowerCase()}`}
                                >
                                  {appointment.status}
                                </span>
                              </td>

                            </tr>

                          ))

                        ) : (

                          <tr>
                            <td colSpan="5">
                              No appointments scheduled for today.
                            </td>
                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                </section>

                {/* Queue Overview */}
                <section className="queue-section">

                  <h2>Queue Overview</h2>

                  <div className="queue-card">

                    <div>
                      <p>Waiting Patients</p>
                      <h2>{queueStats.waiting} Patients</h2>
                    </div>

                    <div>
                      <p>Patients In Progress</p>
                      <h2>{queueStats.inProgress} Patients</h2>
                    </div>

                    <div>
                      <p>Completed Today</p>
                      <h2>{queueStats.completed} Patients</h2>
                    </div>

                  </div>

                </section>

              </>

            )}

          </>

        ) : activePage === "Patients" ? (

          <Patients />

        ) : activePage === "Doctors" ? (

          <Doctors />

        ) : activePage === "Departments" ? (

          <Departments />

        ) : activePage === "Availability" ? (

          <Availability />

        ) : activePage === "Appointments" ? (

          <Appointments />

        ) : activePage === "Appointment List" ? (

          <AppointmentList />

        ) : activePage === "Queue Management" ? (

          <QueueManagement />

        ) : activePage === "Reports" ? (

          <Reports />

        ) : (

          <section className="placeholder-section">
            <h2>{activePage}</h2>
            <p>
              The {activePage} module will be developed next.
            </p>
          </section>

        )}

      </main>

    </div>
  );
}

export default App;
