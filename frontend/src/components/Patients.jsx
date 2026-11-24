
import { useEffect, useState } from "react";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
    address: ""
  });

  // Get all patients from backend
  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/patients");
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or update patient
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:5001/api/patients/${editingId}`
      : "http://localhost:5001/api/patients/add";

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to save patient");
        return;
      }

      alert(editingId ? "Patient updated successfully" : "Patient added successfully");

      setFormData({
        name: "",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: ""
      });

      setEditingId(null);
      setShowForm(false);
      fetchPatients();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  // Edit patient
  const handleEdit = (patient) => {
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      email: patient.email,
      address: patient.address
    });

    setEditingId(patient._id);
    setShowForm(true);
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/patients/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to delete patient");
        return;
      }

      alert("Patient deleted successfully");
      fetchPatients();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  return (
    <div className="patients-page">

      <div className="patient-header">
        <div>
          <h2>Patient Management</h2>
          <p>Register and manage patient information.</p>
        </div>

        <button onClick={() => {
          setFormData({
            name: "",
            age: "",
            gender: "",
            contact: "",
            email: "",
            address: ""
          });
          setEditingId(null);
          setShowForm(!showForm);
        }}>
          + Add Patient
        </button>
      </div>

      {showForm && (
        <form className="patient-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Update Patient" : "Register New Patient"}</h3>

          <div className="form-grid">
            <input name="name" placeholder="Patient Name" value={formData.name} onChange={handleChange} required />
            <input name="age" type="number" min="0" placeholder="Age" value={formData.age} onChange={handleChange} required />

            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Patient" : "Save Patient"}
            </button>

            <button type="button" onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="patient-list">
        <h3>Registered Patients ({patients.length})</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.contact}</td>
                    <td>{patient.email}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(patient)}>
                        Edit
                      </button>

                      <button className="delete-btn" onClick={() => handleDelete(patient._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No patients registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Patients;
