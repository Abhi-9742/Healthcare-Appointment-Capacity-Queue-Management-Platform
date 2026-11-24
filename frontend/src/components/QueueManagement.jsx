
import { useEffect, useState } from "react";

function QueueManagement() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  // Load doctors and appointments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorRes, appointmentRes] = await Promise.all([
          fetch("http://localhost:5001/api/doctors"),
          fetch("http://localhost:5001/api/appointments")
        ]);

        const doctorData = await doctorRes.json();
        const appointmentData = await appointmentRes.json();

        setDoctors(
          Array.isArray(doctorData)
            ? doctorData
            : doctorData.doctors || []
        );

        setAppointments(
          Array.isArray(appointmentData)
            ? appointmentData
            : appointmentData.appointments || []
        );
      } catch (error) {
        console.error("Error loading queue data:", error);
      }
    };

    loadData();
  }, []);

  // Load queue for selected doctor and date
  const fetchQueue = async () => {
    if (!doctorId || !appointmentDate) {
      alert("Please select a doctor and date.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/queue/${doctorId}?date=${appointmentDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load queue.");
        return;
      }

      setQueue(
        Array.isArray(data)
          ? data
          : data.queue || []
      );
    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend.");
    }
  };

  // Add appointment to queue
  const addToQueue = async (appointmentId) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/queue/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            appointmentId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to add patient to queue.");
        return;
      }

      alert("Patient added to queue successfully.");
      fetchQueue();
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  // Update queue status
  const updateStatus = async (queueId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/queue/update/${queueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to update queue.");
        return;
      }

      fetchQueue();
    } catch (error) {
      alert("Backend connection failed.");
    }
  };

  const bookedAppointments = appointments.filter(item => {
    const itemDoctor = item.doctor?._id || item.doctor;
    const itemDate = new Date(item.appointmentDate)
      .toLocaleDateString("en-CA");

    return (
      itemDoctor === doctorId &&
      itemDate === appointmentDate &&
      item.status === "Booked"
    );
  });

  return (
    <div className="patients-page">
      <div className="patient-header">
        <div>
          <h2>Queue Management</h2>
          <p>Manage patient waiting lists and consultation status.</p>
        </div>
      </div>

      <div className="patient-form">
        <h3>Select Doctor and Date</h3>

        <div className="form-grid">
          <select
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={appointmentDate}
            onChange={e => setAppointmentDate(e.target.value)}
          />
        </div>

        <button className="slot-button" onClick={fetchQueue}>
          View Queue
        </button>
      </div>

      <div className="patient-list">
        <h3>Booked Appointments</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookedAppointments.length > 0 ? (
                bookedAppointments.map(item => (
                  <tr key={item._id}>
                    <td>{item.patient?.name || "N/A"}</td>
                    <td>{item.timeSlot}</td>
                    <td>{item.priority}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => addToQueue(item._id)}
                      >
                        Add to Queue
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No booked appointments for this doctor and date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="patient-list">
        <h3>Today's Patient Queue ({queue.length})</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Queue No.</th>
                <th>Patient</th>
                <th>Appointment Time</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {queue.length > 0 ? (
                queue.map(item => (
                  <tr key={item._id}>
                    <td>{item.queueNumber}</td>
                    <td>{item.patient?.name || "N/A"}</td>
                    <td>{item.appointment?.timeSlot || "N/A"}</td>
                    <td>{item.status}</td>
                    <td>
                      <select
                        value={item.status}
                        onChange={e =>
                          updateStatus(item._id, e.target.value)
                        }
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Skipped">Skipped</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No patients in the queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default QueueManagement;
