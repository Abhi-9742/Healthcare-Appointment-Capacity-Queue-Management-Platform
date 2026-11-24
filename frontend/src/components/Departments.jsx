
import { useEffect, useState } from "react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    location: ""
  };

  const [formData, setFormData] = useState(emptyForm);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/departments"
      );

      const data = await response.json();

      setDepartments(
        Array.isArray(data) ? data : data.departments || []
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or update department
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:5001/api/departments/${editingId}`
      : "http://localhost:5001/api/departments/add";

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
        alert(result.message || "Unable to save department");
        return;
      }

      alert(
        editingId
          ? "Department updated successfully"
          : "Department added successfully"
      );

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

      fetchDepartments();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  // Edit department
  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      description: department.description,
      location: department.location
    });

    setEditingId(department._id);
    setShowForm(true);
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/departments/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to delete department");
        return;
      }

      alert("Department deleted successfully");
      fetchDepartments();

    } catch (error) {
      alert("Backend connection failed");
      console.error(error);
    }
  };

  return (
    <div className="patients-page">

      <div className="patient-header">
        <div>
          <h2>Department Management</h2>
          <p>Manage hospital departments and their locations.</p>
        </div>

        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Add Department
        </button>
      </div>

      {/* Department Form */}
      {showForm && (
        <form className="patient-form" onSubmit={handleSubmit}>
          <h3>
            {editingId ? "Update Department" : "Add New Department"}
          </h3>

          <div className="form-grid">
            <input
              name="name"
              placeholder="Department Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              name="location"
              placeholder="Department Location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Department Description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Department" : "Save Department"}
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

      {/* Department List */}
      <div className="patient-list">
        <h3>Registered Departments ({departments.length})</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department._id}>
                    <td>{department.name}</td>
                    <td>{department.description}</td>
                    <td>{department.location}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(department)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(department._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No departments registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Departments;
