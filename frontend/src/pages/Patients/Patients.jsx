
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../../services/api";
import "./Patients.css";


function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    sessionStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

function getStoredUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null")
    );
  } catch {
    return null;
  }
}

function Patients() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Your login session is missing. Please log in again.");
      return;
    }

    if (!patientId) {
      setLoading(false);
      setError("Patient ID is missing from the URL.");
      return;
    }

    const controller = new AbortController();

    const fetchPatient = async () => {
      setLoading(true);
      setError("");
      setPatient(null);

      try {
        const token = getAccessToken();

        if (!token) {
          setError("Login token is missing. Please log in again.");
          return;
        }

        const response = await fetch(
          API_URL + "/patients/" + encodeURIComponent(patientId) + "/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setError("Your login session has expired. Please log in again.");
          } else if (response.status === 403) {
            setError("You are not authorized to view this patient.");
          } else if (response.status === 404) {
            setError("Patient not found. Please check the patient ID.");
          } else {
            setError(
              data.detail ||
                `Unable to load patient details (${response.status}).`
            );
          }
          return;
        }

        setPatient(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Patient fetch error:", err);
          setError("Unable to connect to the server. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPatient();

    return () => controller.abort();
  }, [patientId, user]);

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const handleLogout = () => {
    [
      "access",
      "refresh",
      "access_token",
      "refresh_token",
      "user",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setUser(null);
    navigate("/", { replace: true });
  };

  const goBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <main className="patient-details-page">
        <div className="patient-loading-card">
          <div className="patient-loader" />
          <h2>Loading patient details</h2>
          <p>Please wait while we retrieve the information.</p>
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="patient-details-page">
        <div className="patient-page-topbar">
          <button className="back-button" onClick={goBack}>
            <span aria-hidden="true">â†</span> Back to Dashboard
          </button>

          <button className="back-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="patient-empty-state">
          <div className="patient-empty-icon" aria-hidden="true">
            !
          </div>

          <h2>Unable to load patient</h2>

          <p className="patients-error">
            {error || "No patient information is available."}
          </p>

          <button
            className="handoff-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const patientIdentifier = patient.patient_id || patient.id || "N/A";

  const assignedNurse =
    patient.assigned_nurse_name ||
    (typeof patient.assigned_nurse === "object"
      ? patient.assigned_nurse?.username
      : patient.assigned_nurse) ||
    "Not assigned";

  return (
    <main className="patient-details-page">
      <div className="patient-page-topbar">
        <button className="back-button" onClick={goBack}>
          <span aria-hidden="true">â†</span> Back to Dashboard
        </button>

        <span className="patient-page-label">Patient Management</span>
      </div>

      <section className="patient-details-header">
        <div className="patient-large-avatar">
          {getInitials(patient.name)}
        </div>

        <div className="patient-header-info">
          <span className="patient-section-eyebrow">
            PATIENT PROFILE
          </span>

          <h1>{patient.name || "Unnamed Patient"}</h1>

          <p>
            Patient ID: <strong>{patientIdentifier}</strong>
          </p>
        </div>

        <div className="patient-header-badge">
          <span className="patient-status-dot" />
          {patient.status || "Active"}
        </div>
      </section>

      <section className="patient-overview-strip">
        <div className="overview-item">
          <span className="overview-icon blue-icon">ID</span>
          <div>
            <span className="overview-label">Patient ID</span>
            <strong>{patientIdentifier}</strong>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-icon purple-icon">R</span>
          <div>
            <span className="overview-label">Room Number</span>
            <strong>{patient.room_number || "Not assigned"}</strong>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-icon green-icon">+</span>
          <div>
            <span className="overview-label">Assigned Nurse</span>
            <strong>{assignedNurse}</strong>
          </div>
        </div>
      </section>

      <section className="details-card">
        <div className="patient-card-heading">
          <div className="patient-card-icon blue-icon">01</div>
          <div>
            <h2>Personal Information</h2>
            <p>Basic patient and admission details</p>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-field">
            <span>Patient ID</span>
            <strong>{patientIdentifier}</strong>
          </div>

          <div className="detail-field">
            <span>Full Name</span>
            <strong>{patient.name || "Not provided"}</strong>
          </div>

          <div className="detail-field">
            <span>Age</span>
            <strong>
              {patient.age != null && patient.age !== ""
                ? `${patient.age} years`
                : "Not provided"}
            </strong>
          </div>

          <div className="detail-field">
            <span>Gender</span>
            <strong>{patient.gender || "Not provided"}</strong>
          </div>

          <div className="detail-field">
            <span>Room Number</span>
            <strong>{patient.room_number || "Not assigned"}</strong>
          </div>

          <div className="detail-field">
            <span>Admission Date</span>
            <strong>{formatDate(patient.admission_date)}</strong>
          </div>

          <div className="detail-field">
            <span>Patient Status</span>
            <strong>{patient.status || "Active"}</strong>
          </div>

          {patient.discharge_date && (
            <div className="detail-field">
              <span>Discharge Date</span>
              <strong>{formatDate(patient.discharge_date)}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="details-card">
        <div className="patient-card-heading">
          <div className="patient-card-icon red-icon">02</div>
          <div>
            <h2>Medical Information</h2>
            <p>Diagnosis and allergy information</p>
          </div>
        </div>

        <div className="medical-info">
          <div className="medical-detail">
            <span className="medical-label">
              <span className="medical-dot diagnosis-dot" />
              Diagnosis
            </span>
            <p>{patient.diagnosis || "Not provided"}</p>
          </div>

          <div className="medical-detail">
            <span className="medical-label">
              <span className="medical-dot allergy-dot" />
              Allergies
            </span>
            <p>{patient.allergies || "None reported"}</p>
          </div>
        </div>
      </section>

      <section className="details-card">
        <div className="patient-card-heading">
          <div className="patient-card-icon green-icon">03</div>
          <div>
            <h2>Care Information</h2>
            <p>Patient's assigned care provider</p>
          </div>
        </div>

        <div className="care-information">
          <div className="care-avatar">
            {getInitials(String(assignedNurse)) || "N"}
          </div>

          <div className="care-provider-info">
            <span>Assigned Nurse</span>
            <strong>{assignedNurse}</strong>
          </div>
        </div>
      </section>

      <section className="patient-action-panel">
        <div>
          <h2>Shift Handover</h2>
          <p>
            Prepare a handoff for this patient to support continuity of care.
          </p>
        </div>

        <button
          className="handoff-button"
          disabled={patient.status === "Discharged"}
          onClick={() =>
            navigate("/new-handoff", {
              state: { patientId: patient.id },
            })
          }
        >
          <span aria-hidden="true">+</span>
          Create New Handoff
          <span aria-hidden="true">â†’</span>
        </button>
      </section>

      <footer className="patient-page-footer">
        HandoverMind Â· Patient Management
      </footer>
    </main>
  );
}

export default Patients;

