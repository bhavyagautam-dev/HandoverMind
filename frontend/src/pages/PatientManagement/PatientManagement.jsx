
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientManagement.css";

const API_URL = "http://127.0.0.1:8000/api/patients/";

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  room_number: "",
  diagnosis: "",
  allergies: "",
};

function PatientManagement() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const getToken = () =>
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  // ==========================================
  // API RESPONSE HANDLER
  // ==========================================

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Server returned HTML instead of JSON. Check Django terminal."
      );
    }
  };

  // ==========================================
  // FETCH PATIENTS
  // ==========================================

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        throw new Error(
          data.detail || "Unable to load patient records."
        );
      }

      const list = Array.isArray(data) ? data : data.results;

      setPatients(Array.isArray(list) ? list : []);

    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingPatient(null);
    setShowForm(false);
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD PATIENT
  // ==========================================

  const handleAddClick = () => {
    setError("");
    setSuccess("");
    setEditingPatient(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  // ==========================================
  // EDIT PATIENT
  // ==========================================

  const handleEdit = (patient) => {
    if (patient.status === "Discharged") return;

    setError("");
    setSuccess("");
    setEditingPatient(patient);

    setForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      room_number: patient.room_number || "",
      diagnosis: patient.diagnosis || "",
      allergies: patient.allergies || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SAVE / UPDATE PATIENT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const isEditing = Boolean(editingPatient);

      const url = isEditing
        ? `${API_URL}${editingPatient.id}/`
        : API_URL;

      // Patient ID and Admission Date are NOT sent.
      // Backend generates both automatically.

      const payload = {
        ...form,
        age: Number(form.age),
      };

      // Patient assignment is managed separately by Manager.
      if (!isEditing) {
        payload.assigned_nurse = null;
      }

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        const details =
          data.detail ||
          Object.entries(data)
            .map(([key, value]) => {
              const message = Array.isArray(value)
                ? value.join(", ")
                : String(value);

              return `${key}: ${message}`;
            })
            .join(" | ");

        throw new Error(details || "Unable to save patient.");
      }

      resetForm();

      setSuccess(
        isEditing
          ? "Patient details updated successfully."
          : `Patient added successfully. Patient ID: ${data.patient_id}`
      );

      await fetchPatients();

    } catch (err) {
      setError(err.message || "Unable to save patient.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DISCHARGE PATIENT
  // ==========================================

  const handleDischarge = async (patient) => {
    if (patient.status === "Discharged") return;

    const confirmed = window.confirm(
      `Discharge ${patient.name} (${patient.patient_id})?\n\n` +
      "The patient record and handoff history will be retained."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}${patient.id}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "discharge",
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        throw new Error(
          data.detail || "Unable to discharge patient."
        );
      }

      setSuccess(`${patient.name} has been discharged.`);

      await fetchPatients();

    } catch (err) {
      setError(err.message || "Unable to discharge patient.");
    }
  };

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    // Avoid timezone shifting for date-only values.
    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredPatients = patients.filter((patient) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      patient.name,
      patient.patient_id,
      patient.room_number,
      patient.diagnosis,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );

    const status = patient.status || "Active";

    const matchesStatus =
      statusFilter === "All" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // STATISTICS
  // ==========================================

  const activeCount = patients.filter(
    (patient) => patient.status !== "Discharged"
  ).length;

  const dischargedCount = patients.filter(
    (patient) => patient.status === "Discharged"
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="pm-page">

      {/* HEADER */}

      <header className="pm-header">
        <div>
          <p className="pm-eyebrow">
            HANDOVERMIND / MANAGEMENT
          </p>

          <h1>Patient Management</h1>

          <p className="pm-subtitle">
            Manage patient records, admissions and discharge status.
          </p>
        </div>

        <button
          type="button"
          className="pm-primary-btn"
          onClick={handleAddClick}
        >
          + Add Patient
        </button>
      </header>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="pm-message pm-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="pm-message pm-success" role="status">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <section className="pm-stats">

        <article className="pm-stat-card">
          <span className="pm-stat-label">
            Total Patients
          </span>
          <strong>{patients.length}</strong>
        </article>

        <article className="pm-stat-card">
          <span className="pm-stat-label">
            Active Patients
          </span>
          <strong>{activeCount}</strong>
        </article>

        <article className="pm-stat-card">
          <span className="pm-stat-label">
            Discharged
          </span>
          <strong>{dischargedCount}</strong>
        </article>

      </section>

      {/* ADD / EDIT FORM */}

      {showForm && (
        <section className="pm-card pm-form-card">

          <div className="pm-section-heading">
            <div>
              <h2>
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </h2>

              <p className="pm-muted">
                {editingPatient
                  ? "Update the patient's record."
                  : "Enter the patient's admission and medical details."}
              </p>
            </div>

            <button
              type="button"
              className="pm-icon-close"
              aria-label="Close form"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="pm-form-grid">

              {/* PATIENT NAME */}

              <label>
                Full Name *

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient name"
                />
              </label>

              {/* AGE */}

              <label>
                Age *

                <input
                  name="age"
                  type="number"
                  min="0"
                  max="130"
                  value={form.age}
                  onChange={handleChange}
                  required
                  placeholder="Enter age"
                />
              </label>

              {/* GENDER */}

              <label>
                Gender *

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              {/* ROOM NUMBER */}

              <label>
                Room Number *

                <input
                  name="room_number"
                  value={form.room_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter room number"
                />
              </label>

              {/* DIAGNOSIS */}

              <label className="pm-full-width">
                Diagnosis *

                <textarea
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Enter patient diagnosis"
                />
              </label>

              {/* ALLERGIES */}

              <label className="pm-full-width">
                Allergies

                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Known allergies or None reported"
                />
              </label>

            </div>

            <div className="pm-form-actions">

              <button
                type="submit"
                className="pm-primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingPatient
                    ? "Update Patient"
                    : "Save Patient"}
              </button>

              <button
                type="button"
                className="pm-secondary-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>
        </section>
      )}

      {/* PATIENT RECORDS */}

      <section className="pm-card">

        <div className="pm-list-heading">

          <div>
            <h2>Patient Records</h2>

            <p className="pm-muted">
              {filteredPatients.length} of {patients.length} patient records
            </p>
          </div>

          {/* SEARCH AND FILTER */}

          <div className="pm-filters">

            <input
              className="pm-search"
              type="search"
              placeholder="Search name, ID, room..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="pm-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter patients by status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
            </select>

          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="pm-empty-state">
            Loading patient records...
          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="pm-empty-state">
            <h3>No patients found</h3>
            <p>Try another search or add a patient record.</p>
          </div>

        ) : (

          <div className="pm-table-wrapper">

            <table className="pm-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Admission Date</th>
                  <th>Room</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredPatients.map((patient) => (

                  <tr key={patient.id}>

                    {/* PATIENT NAME */}

                    <td>
                      <div className="pm-patient-name">

                        <span className="pm-avatar">
                          {(patient.name || "?")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span>
                          {patient.name || "Unnamed Patient"}
                        </span>

                      </div>
                    </td>

                    {/* AUTO PATIENT ID */}

                    <td>
                      {patient.patient_id || "—"}
                    </td>

                    {/* AUTO ADMISSION DATE */}

                    <td>
                      {formatDate(patient.admission_date)}
                    </td>

                    {/* ROOM */}

                    <td>
                      {patient.room_number || "—"}
                    </td>

                    {/* DIAGNOSIS */}

                    <td className="pm-diagnosis">
                      {patient.diagnosis || "—"}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`pm-status ${
                          patient.status === "Discharged"
                            ? "pm-discharged"
                            : "pm-active"
                        }`}
                      >
                        {patient.status || "Active"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="pm-actions">

                        <button
                          type="button"
                          className="pm-edit-btn"
                          onClick={() => handleEdit(patient)}
                          disabled={patient.status === "Discharged"}
                        >
                          Edit
                        </button>

                        {patient.status !== "Discharged" && (
                          <button
                            type="button"
                            className="pm-discharge-btn"
                            onClick={() => handleDischarge(patient)}
                          >
                            Discharge
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default PatientManagement;
