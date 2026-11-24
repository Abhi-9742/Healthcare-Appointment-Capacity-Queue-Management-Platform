
import { useEffect, useState } from "react";

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchStats = async () => {
    try {
        const response = await fetch(
            "http://localhost:5001/api/dashboard/stats"
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load reports");
        }

        setStats({
            totalAppointments: data.statistics.totalAppointments,
            booked: data.statistics.bookedAppointments,
            completed: data.statistics.completedAppointments,
            cancelled: data.statistics.cancelledAppointments,
            missed: data.statistics.missedAppointments,
            waitingQueue: data.statistics.waitingQueue,
            departmentWorkload: data.departmentWorkload
        });

    } catch (error) {
        console.error("Reports error:", error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="patients-page">Loading reports...</div>;
  }

  if (!stats) {
    return (
      <div className="patients-page">
        <h2>Reports & Analytics</h2>
        <p>Unable to load reports. Please check your backend.</p>
        <button className="slot-button" onClick={fetchStats}>
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Appointments Today",
      value: stats.totalAppointments ?? 0,
      icon: "📅"
    },
    {
      title: "Booked Appointments",
      value: stats.booked ?? 0,
      icon: "📋"
    },
    {
      title: "Completed Appointments",
      value: stats.completed ?? 0,
      icon: "✅"
    },
    {
      title: "Cancelled Appointments",
      value: stats.cancelled ?? 0,
      icon: "❌"
    },
    {
      title: "Missed Appointments",
      value: stats.missed ?? 0,
      icon: "⏰"
    },
    {
      title: "Waiting Patients",
      value: stats.waitingQueue ?? 0,
      icon: "👥"
    }
  ];

  const departments = Object.entries(
    stats.departmentWorkload || {}
  );

  return (
    <div className="patients-page">
      <div className="patient-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Overview of hospital appointment operations.</p>
        </div>

        <button onClick={fetchStats}>Refresh Reports</button>
      </div>

      <div className="report-grid">
        {cards.map((card, index) => (
          <div className="report-card" key={index}>
            <span className="report-icon">{card.icon}</span>
            <h3>{card.title}</h3>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="patient-list">
        <h3>Department Workload</h3>

        {departments.length > 0 ? (
          departments.map(([name, count]) => {
            const maximum = Math.max(
              ...departments.map(([, value]) => Number(value)),
              1
            );

            const percentage = (Number(count) / maximum) * 100;

            return (
              <div className="workload-item" key={name}>
                <div className="workload-heading">
                  <strong>{name}</strong>
                  <span>{count} appointments</span>
                </div>

                <div className="workload-bar">
                  <div
                    className="workload-progress"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p>No department workload data available.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
