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
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("access_token");

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
        setError(data.detail || "Unable to load patient");
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="patient-details-page">Loading...</div>;
  }

  if (error) {
    return (
      <div className="patient-details-page">
        <p className="patients-error">{error}</p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="patient-details-page">

      <button
        className="back-button"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="patient-details-header">
        <div className="patient-large-avatar">
          {patient.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div>
          <h1>{patient.name}</h1>

          <p>
            Patient ID: {patient.patient_id}
          </p>
        </div>
      </div>


      {/* Patient Information */}

      <div className="details-card">

        <h2>Patient Information</h2>

        <div className="details-grid">

          <div>
            <span>Patient ID</span>
            <strong>{patient.patient_id}</strong>
          </div>

          <div>
            <span>Name</span>
            <strong>{patient.name}</strong>
          </div>

          <div>
            <span>Age</span>
            <strong>{patient.age} years</strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>{patient.gender}</strong>
          </div>

          <div>
            <span>Room Number</span>
            <strong>{patient.room_number}</strong>
          </div>

          <div>
            <span>Admission Date</span>
            <strong>{patient.admission_date}</strong>
          </div>

        </div>

      </div>


      {/* Medical Information */}

      <div className="details-card">

        <h2>Medical Information</h2>

        <div className="medical-info">

          <div>
            <span>Diagnosis</span>
            <p>
              {patient.diagnosis || "Not provided"}
            </p>
          </div>

          <div>
            <span>Allergies</span>
            <p>
              {patient.allergies || "None reported"}
            </p>
          </div>

        </div>

      </div>


      {/* Assigned Nurse */}

      <div className="details-card">

        <h2>Care Information</h2>

        <div className="details-grid">

          <div>
            <span>Assigned Nurse ID</span>
            <strong>
              {patient.assigned_nurse || "Not assigned"}
            </strong>
          </div>

        </div>

      </div>


      {/* Handoff Button */}

      <div className="patient-actions">

        <button className="handoff-button">
          + Create New Handoff
        </button>

      </div>

    </div>
  );
}

export default Patients;