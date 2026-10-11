import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./NewHandoff.css";

function NewHandoff() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(
    initialPatientId != null ? String(initialPatientId) : ""
  );

  const [handoffText, setHandoffText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/patients/",
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
          setError(
            data.detail || "Unable to load patients. Please try again."
          );
          return;
        }

        if (!Array.isArray(data)) {
          setError("Unexpected patient data received from the server.");
          return;
        }

        setPatients(data);

        if (initialPatientId != null) {
          const matchingPatient = data.find(
            (patient) => String(patient.id) === String(initialPatientId)
          );

          setSelectedPatient(
            matchingPatient ? String(matchingPatient.id) : ""
          );
        }
      } catch (err) {
        console.error("Error loading patients:", err);
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [navigate, initialPatientId]);

  const currentPatient = patients.find(
    (patient) => String(patient.id) === selectedPatient
  );

  const handleSaveDraft = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    if (!handoffText.trim()) {
      setError("Please enter handoff notes.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

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
            input_text: handoffText.trim(),
            status: "Draft",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Save draft failed:", data);

        setError(
          data.detail || "Unable to save handoff. Please try again."
        );
        return;
      }

      setMessage("Handoff saved as draft successfully.");
      setHandoffText("");
    } catch (err) {
      console.error("Error saving handoff:", err);
      setError("Unable to connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrepareHandoff = () => {
    setError("");
    setMessage("");

    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    if (!handoffText.trim()) {
      setError("Please enter handoff notes.");
      return;
    }

    setMessage(
      "Your notes are ready. AI generation will be enabled after the AI API is connected."
    );
  };

  const handleClearNotes = () => {
    setHandoffText("");
    setError("");
    setMessage("");
  };

  return (
    <main className="new-handoff-page">
      <div className="handoff-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <span className="handoff-breadcrumb">
          HandoverMind <span>/</span> New Handoff
        </span>
      </div>

      <header className="handoff-header">
        <div className="handoff-title-icon" aria-hidden="true">
          +
        </div>

        <div>
          <span className="handoff-eyebrow">PATIENT CARE</span>
          <h1>Create New Handoff</h1>
          <p>
            Document important patient information for a smooth nursing
            shift transition.
          </p>
        </div>
      </header>

      <div className="handoff-workspace">
        <form className="handoff-card" onSubmit={handleSaveDraft}>
          <div className="handoff-card-header">
            <div>
              <h2>Handoff Information</h2>
              <p>Complete the details below before saving your handoff.</p>
            </div>

            <span className="draft-status-badge">
              <span></span>
              Draft mode
            </span>
          </div>

          <div className="handoff-divider"></div>

          <div className="form-group">
            <label htmlFor="patient-select">
              Select Patient <span className="required-star">*</span>
            </label>

            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(event) => {
                setSelectedPatient(event.target.value);
                setError("");
                setMessage("");
              }}
              disabled={loading || saving}
              required
            >
              <option value="">
                {loading ? "Loading patients..." : "Choose a patient"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={String(patient.id)}>
                  {patient.name} — Room {patient.room_number || "N/A"}
                </option>
              ))}
            </select>

            <small>
              Select the patient whose care information you are handing over.
            </small>

            {!loading && !error && patients.length === 0 && (
              <div className="handoff-inline-info">
                No patients are currently available.
              </div>
            )}
          </div>

          {currentPatient && (
            <section className="selected-patient-card">
              <div className="selected-patient-avatar">
                {String(currentPatient.name || "P")
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="selected-patient-details">
                <span>SELECTED PATIENT</span>
                <h3>{currentPatient.name}</h3>
                <p>
                  ID: {currentPatient.patient_id || currentPatient.id}
                  {" · "}
                  Room: {currentPatient.room_number || "N/A"}
                </p>
              </div>

              <span className="selected-check" aria-label="Selected">
                ✓
              </span>
            </section>
          )}

          <div className="form-group handoff-notes-group">
            <div className="notes-label-row">
              <label htmlFor="handoff-notes">
                Handoff Notes <span className="required-star">*</span>
              </label>

              <span className="character-count">
                {handoffText.length} characters
              </span>
            </div>

            <textarea
              id="handoff-notes"
              value={handoffText}
              onChange={(event) => {
                setHandoffText(event.target.value);
                setError("");
                setMessage("");
              }}
              placeholder={
                "Document the patient's current condition, symptoms, vital signs, medications, pending tasks, recent events and nursing observations..."
              }
              rows={10}
              required
              disabled={saving}
            />

            <small>
              Include relevant clinical observations, ongoing treatment and
              pending care tasks. Follow your hospital's documentation policy.
            </small>
          </div>

          <div className="voice-section">
            <div className="voice-icon" aria-hidden="true">
              🎙
            </div>

            <div className="voice-description">
              <strong>Voice-assisted documentation</strong>
              <span>
                Dictation can help make note-taking more convenient.
              </span>
            </div>

            <button
              type="button"
              className="voice-button"
              disabled
              title="Voice input has not been implemented yet"
            >
              Voice Input
            </button>
          </div>

          {error && (
            <div className="handoff-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </div>
          )}

          {message && (
            <div className="handoff-success" role="status">
              <span aria-hidden="true">✓</span>
              {message}
            </div>
          )}

          <div className="handoff-actions">
            <button
              type="button"
              className="draft-button"
              onClick={handleClearNotes}
              disabled={saving || (!handoffText && !error && !message)}
            >
              Clear Notes
            </button>

            <button
              type="submit"
              className="save-draft-button"
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              className="generate-button"
              onClick={handlePrepareHandoff}
              disabled={saving || loading}
            >
              Prepare Handoff
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <aside className="handoff-guidance-card">
          <div className="guidance-icon" aria-hidden="true">
            i
          </div>

          <h2>Handoff checklist</h2>

          <p>
            Keep your handoff notes clear, factual and focused on continuity
            of care.
          </p>

          <div className="guidance-divider"></div>

          <ul className="guidance-list">
            <li>
              <span>✓</span>
              Current patient condition
            </li>
            <li>
              <span>✓</span>
              Relevant observations and vital signs
            </li>
            <li>
              <span>✓</span>
              Medications and ongoing treatment
            </li>
            <li>
              <span>✓</span>
              Pending tasks and follow-up
            </li>
            <li>
              <span>✓</span>
              Important risks and concerns
            </li>
          </ul>

          <div className="guidance-reminder">
            <strong>Remember</strong>
            <p>
              Verify clinical details and follow your facility's approved
              handoff procedures.
            </p>
          </div>
        </aside>
      </div>

      <footer className="handoff-footer">
        HandoverMind · Supporting safer nursing shift transitions
      </footer>
    </main>
  );
}

export default NewHandoff;