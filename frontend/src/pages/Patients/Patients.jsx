import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Patients.css";

function Patients() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError("");
      setPatient(null);

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/patients/${patientId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Unable to load patient information.");
          return;
        }

        setPatient(data);
      } catch (err) {
        console.error("Patient fetch error:", err);
        setError("Unable to connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    } else {
      setLoading(false);
    }
  }, [patientId, navigate]);

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

  if (loading) {
    return (
      <main className="patient-details-page">
        <div className="patient-loading-card">
          <div className="patient-loader"></div>
          <h2>Loading patient details</h2>
          <p>Please wait while we retrieve the information.</p>
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="patient-details-page">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span aria-hidden="true">←</span> Back to Dashboard
        </button>

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

  return (
    <main className="patient-details-page">
      <div className="patient-page-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <span className="patient-page-label">
          Patient Management
        </span>
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
            Patient ID:{" "}
            <strong>{patient.patient_id || patient.id}</strong>
          </p>
        </div>

        <div className="patient-header-badge">
          <span className="patient-status-dot"></span>
          Patient Record
        </div>
      </section>

      <section className="patient-overview-strip">
        <div className="overview-item">
          <span className="overview-icon blue-icon">ID</span>
          <div>
            <span className="overview-label">Patient ID</span>
            <strong>{patient.patient_id || patient.id || "N/A"}</strong>
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
            <strong>
              {patient.assigned_nurse || "Not assigned"}
            </strong>
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
            <strong>{patient.patient_id || patient.id || "N/A"}</strong>
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
              <span className="medical-dot diagnosis-dot"></span>
              Diagnosis
            </span>

            <p>{patient.diagnosis || "Not provided"}</p>
          </div>

          <div className="medical-detail">
            <span className="medical-label">
              <span className="medical-dot allergy-dot"></span>
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
            {getInitials(String(patient.assigned_nurse ?? "")) || "N"}
          </div>

          <div className="care-provider-info">
            <span>Assigned Nurse ID</span>
            <strong>
              {patient.assigned_nurse || "Not assigned"}
            </strong>
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
          onClick={() =>
            navigate("/new-handoff", {
              state: { patientId: patient.id },
            })
          }
        >
          <span aria-hidden="true">+</span>
          Create New Handoff
          <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="patient-page-footer">
        HandoverMind · Patient Management
      </footer>
    </main>
  );
}

export default Patients;