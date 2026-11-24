
import { useEffect, useState } from "react";

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    appointmentDate: "",
    timeSlot: ""
  });

  const [rescheduleSlots, setRescheduleSlots] = useState([]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/appointments"
      );
      const data = await response.json();

      setAppointments(
        Array.isArray(data) ? data : data.appointments || []
      );
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/patients"
      );
      const data = await response.json();

      setPatients(
        Array.isArray(data) ? data : data.patients || []
      );
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      alert("Please enter a cancellation reason.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/cancel/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cancellationReason: cancelReason
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Cancellation failed.");
        return;
      }

      alert("Appointment cancelled successfully.");
      setCancelId(null);
      setCancelReason("");
      fetchAppointments();
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  // Load available slots for rescheduling
  const fetchRescheduleSlots = async (appointment) => {
    if (!rescheduleData.appointmentDate) {
      alert("Please select a new appointment date.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/slots/${appointment.doctor?._id || appointment.doctor}?date=${rescheduleData.appointmentDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load slots.");
        return;
      }

      setRescheduleSlots(
        Array.isArray(data)
          ? data
          : data.availableSlots || data.slots || []
      );
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  // Reschedule appointment
  const handleReschedule = async (id) => {
    if (!rescheduleData.appointmentDate || !rescheduleData.timeSlot) {
      alert("Please select a date and time slot.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/reschedule/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(rescheduleData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Rescheduling failed.");
        return;
      }

      alert("Appointment rescheduled successfully.");

      setRescheduleId(null);
      setRescheduleData({
        appointmentDate: "",
        timeSlot: ""
      });
      setRescheduleSlots([]);
      fetchAppointments();
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  // Patient appointment history
  const fetchHistory = async () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/history/${selectedPatient}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load history.");
        return;
      }

      setHistory(data.history || []);
      setShowHistory(true);
    } catch (error) {
      alert("Unable to connect to backend.");
    }
  };

  return (
    <div className="patients-page">
      <div className="patient-header">
        <div>
          <h2>Appointment Management</h2>
          <p>View, cancel and reschedule patient appointments.</p>
        </div>
      </div>

      <div className="patient-list">
        <h3>All Appointments ({appointments.length})</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length > 0 ? (
                appointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td>{appointment.patient?.name || "N/A"}</td>
                    <td>{appointment.doctor?.name || "N/A"}</td>
                    <td>{appointment.department?.name || "N/A"}</td>
                    <td>
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </td>
                    <td>{appointment.timeSlot}</td>
                    <td>{appointment.priority}</td>
                    <td>{appointment.status}</td>
                    <td>
                      {appointment.status === "Booked" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setRescheduleId(appointment._id);
                              setRescheduleData({
                                appointmentDate: "",
                                timeSlot: ""
                              });
                              setRescheduleSlots([]);
                            }}
                          >
                            Reschedule
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => {
                              setCancelId(appointment._id);
                              setCancelReason("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {cancelId && (
        <div className="patient-form">
          <h3>Cancel Appointment</h3>

          <textarea
            rows="3"
            placeholder="Enter cancellation reason"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />

          <div className="form-buttons">
            <button onClick={() => handleCancel(cancelId)}>
              Confirm Cancellation
            </button>
            <button onClick={() => setCancelId(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {rescheduleId && (
        <div className="patient-form">
          <h3>Reschedule Appointment</h3>

          <input
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            value={rescheduleData.appointmentDate}
            onChange={e => {
              setRescheduleData({
                appointmentDate: e.target.value,
                timeSlot: ""
              });
              setRescheduleSlots([]);
            }}
          />

          <button
            type="button"
            className="slot-button"
            onClick={() => {
              const appointment = appointments.find(
                item => item._id === rescheduleId
              );
              fetchRescheduleSlots(appointment);
            }}
          >
            Check Available Slots
          </button>

          <div className="slots-container">
            {rescheduleSlots.map((slot, index) => {
              const value =
                typeof slot === "string" ? slot : slot.timeSlot;

              return (
                <button
                  type="button"
                  key={index}
                  className={
                    rescheduleData.timeSlot === value
                      ? "slot-option selected-slot"
                      : "slot-option"
                  }
                  onClick={() =>
                    setRescheduleData({
                      ...rescheduleData,
                      timeSlot: value
                    })
                  }
                >
                  {value}
                </button>
              );
            })}
          </div>

          <div className="form-buttons">
            <button onClick={() => handleReschedule(rescheduleId)}>
              Confirm Reschedule
            </button>
            <button onClick={() => setRescheduleId(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="patient-list">
        <h3>Patient Appointment History</h3>

        <div className="form-grid">
          <select
            value={selectedPatient}
            onChange={e => setSelectedPatient(e.target.value)}
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>

          <button
            className="slot-button"
            onClick={fetchHistory}
          >
            View History
          </button>
        </div>

        {showHistory && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>
                {history.length > 0 ? (
                  history.map(item => (
                    <tr key={item._id}>
                      <td>{item.doctor?.name || "N/A"}</td>
                      <td>{item.department?.name || "N/A"}</td>
                      <td>
                        {new Date(item.appointmentDate).toLocaleDateString()}
                      </td>
                      <td>{item.timeSlot}</td>
                      <td>{item.status}</td>
                      <td>{item.cancellationReason || item.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No appointment history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentList;
