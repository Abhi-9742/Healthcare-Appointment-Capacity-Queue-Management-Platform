
import { useEffect, useState } from "react";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    specialization: "",
    contact: "",
    email: ""
  };

  const [formData, setFormData] = useState(emptyForm);

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/doctors");
      const data = await response.json();

      setDoctors(Array.isArray(data) ? data : data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or update doctor
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:5001/api/doctors/${editingId}`
      : "http://localhost:5001/api/doctors/add";

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to save doctor");
        return;
      }

      alert(editingId ? "Doctor updated successfully" : "Doctor added successfully");

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchDoctors();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  // Edit doctor
  const handleEdit = (doctor) => {
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      contact: doctor.contact,
      email: doctor.email
    });

    setEditingId(doctor._id);
    setShowForm(true);
  };

  // Delete doctor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/doctors/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to delete doctor");
        return;
      }

      alert("Doctor deleted successfully");
      fetchDoctors();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  return (
    <div className="patients-page">

      <div className="patient-header">
        <div>
          <h2>Doctor Management</h2>
          <p>Register and manage doctor information.</p>
        </div>

        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Add Doctor
        </button>
      </div>

      {/* Doctor Form */}
      {showForm && (
        <form className="patient-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Update Doctor" : "Register New Doctor"}</h3>

          <div className="form-grid">
            <input
              name="name"
              placeholder="Doctor Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              name="specialization"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />

            <input
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Doctor" : "Save Doctor"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Doctor List */}
      <div className="patient-list">
        <h3>Registered Doctors ({doctors.length})</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.contact}</td>
                    <td>{doctor.email}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(doctor)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(doctor._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No doctors registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Doctors;
