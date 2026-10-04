import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewHandoff.css";

function NewHandoff() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [handoffText, setHandoffText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/patients/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPatients(data);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  // SAVE DRAFT
  const handleSaveDraft = async () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    if (!handoffText.trim()) {
      alert("Please enter handoff notes.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/handoffs/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient: Number(selectedPatient),
            input_text: handoffText,
            status: "Draft",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert(data.detail || "Unable to save handoff.");
        return;
      }

      alert("Handoff saved as draft successfully.");

      setHandoffText("");
      setSelectedPatient("");

    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend.");
    }
  };

  // GENERATE HANDOFF
  const handleGenerate = () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    if (!handoffText.trim()) {
      alert("Please enter handoff notes.");
      return;
    }

    alert("AI Handoff generation will be connected next.");
  };

  return (
    <div className="new-handoff-page">

      <div className="handoff-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>New Handoff</h1>

        <p>
          Create a new patient handoff record.
        </p>

      </div>

      <div className="handoff-card">

        {/* PATIENT */}

        <div className="form-group">

          <label>Select Patient</label>

          <select
            value={selectedPatient}
            onChange={(e) =>
              setSelectedPatient(e.target.value)
            }
          >

            <option value="">
              {loading
                ? "Loading patients..."
                : "Select a patient"}
            </option>

            {patients.map((patient) => (
              <option
                key={patient.id}
                value={patient.id}
              >
                {patient.name} — Room {patient.room_number}
              </option>
            ))}

          </select>

        </div>

        {/* HANDOFF NOTES */}

        <div className="form-group">

          <label>Handoff Notes</label>

          <textarea
            value={handoffText}
            onChange={(e) =>
              setHandoffText(e.target.value)
            }
            placeholder="Enter patient's current condition, symptoms, vitals, medications, pending tasks, recent events and nursing notes..."
            rows="10"
          />

        </div>

        {/* VOICE */}

        <div className="voice-section">

          <button className="voice-button">
            🎤 Voice Input
          </button>

          <span>
            Voice-to-text will be added later.
          </span>

        </div>

        {/* ACTIONS */}

        <div className="handoff-actions">

          <button
            className="draft-button"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>

          <button
            className="generate-button"
            onClick={handleGenerate}
          >
            Generate Handoff
          </button>

        </div>

      </div>

    </div>
  );
}

export default NewHandoff;