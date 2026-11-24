
import { useEffect, useState } from "react";

function Availability() {
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState(null);

  const [formData, setFormData] = useState({
    doctor: "",
    workingDays: [],
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "",
    breakEnd: "",
    leaveDate: ""
  });

  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ];

  // Load doctors
  useEffect(() => {
    fetch("http://localhost:5001/api/doctors")
      .then(res => res.json())
      .then(data => {
        setDoctors(Array.isArray(data) ? data : data.doctors || []);
      })
      .catch(error => console.log("Error loading doctors:", error));
  }, []);

  // Update form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Select or unselect working days
  const handleDayChange = (day) => {
    const updatedDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter(item => item !== day)
      : [...formData.workingDays, day];

    setFormData({ ...formData, workingDays: updatedDays });
  };

  // Load existing availability when doctor changes
  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;

    setFormData({
      doctor: doctorId,
      workingDays: [],
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "",
      breakEnd: "",
      leaveDate: ""
    });

    setAvailability(null);

    if (!doctorId) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/availability/${doctorId}`
      );

      const data = await response.json();
      const existing = data.availability || data;

      if (existing && existing.workingDays) {
        setAvailability(existing);

        setFormData({
          doctor: doctorId,
          workingDays: existing.workingDays || [],
          startTime: existing.startTime || "09:00",
          endTime: existing.endTime || "17:00",
          breakStart: existing.breaks?.[0]?.startTime || "",
          breakEnd: existing.breaks?.[0]?.endTime || "",
          leaveDate: ""
        });
      }
    } catch (error) {
      console.log("Error loading availability:", error);
    }
  };

  // Save availability
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.workingDays.length === 0) {
      alert("Please select at least one working day.");
      return;
    }

    if (formData.breakStart && !formData.breakEnd) {
      alert("Please enter the break end time.");
      return;
    }

    if (!formData.breakStart && formData.breakEnd) {
      alert("Please enter the break start time.");
      return;
    }

    const breaks = formData.breakStart && formData.breakEnd
      ? [{
          startTime: formData.breakStart,
          endTime: formData.breakEnd
        }]
      : [];

    const leaveDates = formData.leaveDate
      ? [formData.leaveDate]
      : availability?.leaveDates || [];

    try {
      const response = await fetch(
        "http://localhost:5001/api/availability/set",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            doctor: formData.doctor,
            workingDays: formData.workingDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
            breaks,
            leaveDates
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to save availability.");
        return;
      }

      alert("Doctor availability saved successfully!");
      setAvailability(result.availability || result);

    } catch (error) {
      alert("Backend connection failed.");
      console.log(error);
    }
  };

  return (
    <div className="patients-page">
      <div className="patient-header">
        <div>
          <h2>Doctor Availability</h2>
          <p>Manage doctors' working schedules and breaks.</p>
        </div>
      </div>

      <form className="patient-form" onSubmit={handleSubmit}>
        <h3>Set Doctor Schedule</h3>

        <div className="form-grid">
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleDoctorChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <div>
            <label>Working Days</label>
            <div className="days-container">
              {days.map(day => (
                <label key={day} className="day-option">
                  <input
                    type="checkbox"
                    checked={formData.workingDays.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Break Start</label>
            <input
              type="time"
              name="breakStart"
              value={formData.breakStart}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Break End</label>
            <input
              type="time"
              name="breakEnd"
              value={formData.breakEnd}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Leave Date</label>
            <input
              type="date"
              name="leaveDate"
              value={formData.leaveDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit">Save Availability</button>
        </div>
      </form>

      {availability && (
        <div className="patient-list">
          <h3>Existing Schedule</h3>
          <p>Working Days: {availability.workingDays?.join(", ")}</p>
          <p>
            Working Hours: {availability.startTime} - {availability.endTime}
          </p>
        </div>
      )}
    </div>
  );
}

export default Availability;
