
import { useEffect, useState } from "react";

function Appointments() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [slots, setSlots] = useState([]);

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    department: "",
    appointmentDate: "",
    timeSlot: "",
    reason: "",
    priority: "Normal"
  });

  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load patients, doctors and departments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, doctorRes, departmentRes] = await Promise.all([
          fetch("http://localhost:5001/api/patients"),
          fetch("http://localhost:5001/api/doctors"),
          fetch("http://localhost:5001/api/departments")
        ]);

        const patientData = await patientRes.json();
        const doctorData = await doctorRes.json();
        const departmentData = await departmentRes.json();

        setPatients(
          Array.isArray(patientData)
            ? patientData
            : patientData.patients || []
        );

        setDoctors(
          Array.isArray(doctorData)
            ? doctorData
            : doctorData.doctors || []
        );

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData.departments || []
        );
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    loadData();
  }, []);

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
      ...(name === "doctor" || name === "appointmentDate"
        ? { timeSlot: "" }
        : {})
    });

    if (name === "doctor" || name === "appointmentDate") {
      setSlots([]);
    }
  };

  // Get available slots
  const fetchSlots = async () => {
    if (!formData.doctor || !formData.appointmentDate) {
      alert("Please select a doctor and appointment date.");
      return;
    }

    setLoadingSlots(true);
    setSlots([]);

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/slots/${formData.doctor}?date=${formData.appointmentDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load available slots.");
        return;
      }

      const availableSlots = Array.isArray(data)
        ? data
        : data.availableSlots || data.slots || [];

      setSlots(availableSlots);

      if (availableSlots.length === 0) {
        alert("No available slots for this date.");
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      alert("Unable to connect to the backend.");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Book appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.timeSlot) {
      alert("Please select an available time slot.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/appointments/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Appointment booking failed.");
        return;
      }

      alert("Appointment booked successfully!");

      setFormData({
        patient: "",
        doctor: "",
        department: "",
        appointmentDate: "",
        timeSlot: "",
        reason: "",
        priority: "Normal"
      });

      setSlots([]);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Backend connection failed.");
    }
  };

  return (
    <div className="patients-page">
      <div className="patient-header">
        <div>
          <h2>Appointment Management</h2>
          <p>Book appointments based on doctor availability.</p>
        </div>
      </div>

      <form className="patient-form" onSubmit={handleSubmit}>
        <h3>Book New Appointment</h3>

        <div className="form-grid">
          <select
            name="patient"
            value={formData.patient}
            onChange={handleChange}
            required
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>

          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map(department => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            min={new Date().toLocaleDateString("en-CA")}
            required
          />

          <input
            type="text"
            name="reason"
            placeholder="Reason for Appointment"
            value={formData.reason}
            onChange={handleChange}
            required
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Normal">Normal Priority</option>
            <option value="High">High Priority</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <button
          type="button"
          className="slot-button"
          onClick={fetchSlots}
          disabled={loadingSlots}
        >
          {loadingSlots ? "Loading Slots..." : "Check Available Slots"}
        </button>

        {slots.length > 0 && (
          <div className="slots-section">
            <h3>Available Time Slots</h3>

            <div className="slots-container">
              {slots.map((slot, index) => {
                const slotValue =
                  typeof slot === "string" ? slot : slot.timeSlot;

                return (
                  <button
                    type="button"
                    key={index}
                    className={
                      formData.timeSlot === slotValue
                        ? "slot-option selected-slot"
                        : "slot-option"
                    }
                    onClick={() =>
                      setFormData({
                        ...formData,
                        timeSlot: slotValue
                      })
                    }
                  >
                    {slotValue}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-buttons">
          <button type="submit">Book Appointment</button>
        </div>
      </form>
    </div>
  );
}

export default Appointments;
