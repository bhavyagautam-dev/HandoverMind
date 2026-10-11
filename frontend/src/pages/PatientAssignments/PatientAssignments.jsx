import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientAssignments.css";

function PatientAssignments() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getStorage = () =>
    localStorage.getItem("access_token")
      ? localStorage
      : sessionStorage;

  const getToken = () =>
    getStorage().getItem("access_token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientResponse, nurseResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/patients/", {
          headers: getHeaders(),
        }),
        fetch("http://127.0.0.1:8000/api/nurses/", {
          headers: getHeaders(),
        }),
      ]);

      const patientData = await patientResponse.json();
      const nurseData = await nurseResponse.json();

      if (!patientResponse.ok) {
        throw new Error(
          patientData.detail || "Unable to load patients."
        );
      }

      if (!nurseResponse.ok) {
        throw new Error(
          nurseData.detail || "Unable to load nurses."
        );
      }

      const patientList = Array.isArray(patientData)
        ? patientData
        : patientData.results || [];

      const nurseList = Array.isArray(nurseData)
        ? nurseData
        : nurseData.results || [];

      const activePatients = patientList.filter(
        (patient) => patient.status === "Active"
      );

      setPatients(activePatients);
      setNurses(nurseList);

      const initialAssignments = {};

      activePatients.forEach((patient) => {
        initialAssignments[patient.id] =
          patient.assigned_nurse == null
            ? ""
            : String(patient.assigned_nurse);
      });

      setAssignments(initialAssignments);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = getStorage().getItem("user");

    if (!savedUser) {
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "Manager" && user.role !== "Admin") {
        navigate("/dashboard");
        return;
      }
    } catch {
      navigate("/");
      return;
    }

    loadData();
  }, []);

  const handleAssignmentChange = (patientId, nurseId) => {
    setAssignments((previous) => ({
      ...previous,
      [patientId]: nurseId,
    }));
  };

  const saveAssignment = async (patient) => {
    const selectedNurseId = assignments[patient.id];

    setMessage("");
    setError("");
    setSavingId(patient.id);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/patients/${patient.patient_id}/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            assigned_nurse: selectedNurseId || null,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            Object.entries(data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" | ") ||
            "Unable to update assignment."
        );
      }

      setMessage(
        `Assignment updated for ${patient.name}.`
      );

      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to update assignment."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="patient-assignments">
      <header className="pa-header">
        <div>
          <p className="pa-eyebrow">MANAGER PORTAL</p>
          <h1>Patient Assignments</h1>
          <p className="pa-subtitle">
            Assign active patients to nurses and manage coverage.
          </p>
        </div>

        <button
          className="pa-back-button"
          onClick={() => navigate("/manager")}
        >
          ← Dashboard
        </button>
      </header>

      <section className="pa-summary">
        <div className="pa-summary-card">
          <span>Active Patients</span>
          <strong>{patients.length}</strong>
        </div>

        <div className="pa-summary-card">
          <span>Active Nurses</span>
          <strong>{nurses.length}</strong>
        </div>

        <div className="pa-summary-card">
          <span>Unassigned Patients</span>
          <strong>
            {
              patients.filter(
                (patient) => patient.assigned_nurse == null
              ).length
            }
          </strong>
        </div>
      </section>

      {message && (
        <div className="pa-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="pa-error" role="alert">
          {error}
        </div>
      )}

      <section className="pa-table-card">
        <div className="pa-section-heading">
          <div>
            <h2>Manage Assignments</h2>
            <p>Choose a nurse for each active patient.</p>
          </div>

          <button
            className="pa-refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="pa-empty">Loading assignments...</p>
        ) : patients.length === 0 ? (
          <p className="pa-empty">
            No active patients found.
          </p>
        ) : (
          <div className="pa-table-wrapper">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Room</th>
                  <th>Assigned Nurse</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.patient_id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.room_number || "—"}</td>
                    <td>
                      <select
                        value={assignments[patient.id] ?? ""}
                        onChange={(e) =>
                          handleAssignmentChange(
                            patient.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="">Unassigned</option>

                        {nurses.map((nurse) => (
                          <option
                            key={nurse.id}
                            value={String(nurse.id)}
                          >
                            {nurse.username}
                            {nurse.first_name
                              ? ` (${nurse.first_name} ${nurse.last_name || ""})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="pa-save-button"
                        disabled={
                          savingId === patient.id ||
                          String(patient.assigned_nurse ?? "") ===
                            String(assignments[patient.id] ?? "")
                        }
                        onClick={() => saveAssignment(patient)}
                      >
                        {savingId === patient.id
                          ? "Saving..."
                          : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientAssignments;