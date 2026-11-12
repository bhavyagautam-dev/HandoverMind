import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../../services/api";
import "./NewHandoff.css";


function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    sessionStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

function NewHandoff() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(
    initialPatientId != null ? String(initialPatientId) : ""
  );

  const [handoffText, setHandoffText] = useState("");
  const [reviewedSummary, setReviewedSummary] = useState("");
  const [reviewedRisk, setReviewedRisk] = useState("Low");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [sbarResult, setSbarResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load assigned active patients
  useEffect(() => {
    let cancelled = false;

    async function fetchPatients() {
      setLoading(true);
      setError("");

      try {
        const token = getAccessToken();

        if (!token) {
          setError("Login session missing. Please log in again.");
          return;
        }

        const response = await fetch(`${API_URL}/patients/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : data.detail || "Unable to load patients."
          );
          return;
        }

        const patientList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : null;

        if (!patientList) {
          setError("Unexpected patient data received from the server.");
          return;
        }

        if (cancelled) return;

        const activePatients = patientList.filter(
          (patient) => patient.status === "Active"
        );

        setPatients(activePatients);

        if (initialPatientId != null) {
          const matchingPatient = activePatients.find(
            (patient) => String(patient.id) === String(initialPatientId)
          );

          setSelectedPatient(matchingPatient ? String(matchingPatient.id) : "");

          if (!matchingPatient) {
            setMessage(
              "The selected patient is not in your assigned active patient list."
            );
          }
        }
      } catch (err) {
        console.error("Loading patients failed:", err);

        if (!cancelled) {
          setError("Unable to connect to backend.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPatients();

    return () => {
      cancelled = true;
    };
  }, [initialPatientId]);

  const currentPatient = patients.find(
    (patient) => String(patient.id) === selectedPatient
  );

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // Generate AI SBAR draft
  const handlePrepareHandoff = async () => {
    clearMessages();
    setSbarResult(null);
    setReviewedSummary("");
    setReviewedRisk("Low");

    if (!selectedPatient || !currentPatient) {
      setError("Please select a valid assigned active patient.");
      return;
    }

    if (!handoffText.trim()) {
      setError("Please enter handoff notes.");
      return;
    }

    if (handoffText.trim().length > 10000) {
      setError("Handoff notes must be 10,000 characters or fewer.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("Login session missing. Please log in again.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(
        `${API_URL}/handoffs/generate-sbar/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient: Number(selectedPatient),
            input_text: handoffText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Unable to generate SBAR summary. Please try again."
        );
        return;
      }

      setSbarResult(data);

      const formattedSummary =
        data.sbar_summary ||
        [
          `Situation: ${data.situation || "Not provided"}`,
          `Background: ${data.background || "Not provided"}`,
          `Assessment: ${data.assessment || "Not provided"}`,
          `Recommendation: ${data.recommendation || "Not provided"}`,
        ].join("\n\n");

      setReviewedSummary(formattedSummary);

      setReviewedRisk(
        ["Low", "Medium", "High", "Critical"].includes(data.risk_level)
          ? data.risk_level
          : "Low"
      );

      setMessage(
        "SBAR draft generated. Review and correct it before saving."
      );
    } catch (err) {
      console.error("SBAR generation failed:", err);
      setError("Unable to connect to backend. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Save as Draft or submit handoff
  const handleConfirmAndSave = async (targetStatus = "Draft") => {
    clearMessages();

    if (!["Draft", "Submitted"].includes(targetStatus)) {
      setError("Invalid handoff status.");
      return;
    }

    if (!selectedPatient || !currentPatient) {
      setError("Please select a valid assigned active patient.");
      return;
    }

    if (!handoffText.trim()) {
      setError("Original handoff notes are required.");
      return;
    }

    if (!sbarResult || !reviewedSummary.trim()) {
      setError("Generate and review the SBAR before saving.");
      return;
    }

    if (!["Low", "Medium", "High", "Critical"].includes(reviewedRisk)) {
      setError("Please select a valid risk level.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("Login session missing. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/handoffs/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient: Number(selectedPatient),
          input_text: handoffText.trim(),
          sbar_summary: reviewedSummary.trim(),
          risk_level: reviewedRisk,
          status: targetStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Saving handoff failed:", data);

        setError(
          data.detail ||
            JSON.stringify(data) ||
            "Unable to save handoff. Please try again."
        );
        return;
      }

      if (targetStatus === "Draft") {
        setMessage("Draft saved. Patient assignment should remain unchanged.");
      } else if (data.reassignment?.reassigned) {
        setMessage(
          `Handoff submitted. Patient reassigned to ${
            data.reassignment.incoming_nurse_username || "the incoming nurse"
          }.`
        );
      } else {
        setMessage(
          data.reassignment?.message ||
            "Handoff submitted, but reassignment was not confirmed."
        );
      }

      setHandoffText("");
      setSbarResult(null);
      setReviewedSummary("");
      setReviewedRisk("Low");
    } catch (err) {
      console.error("Saving handoff failed:", err);
      setError("Unable to connect to backend. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearNotes = () => {
    setHandoffText("");
    setSbarResult(null);
    setReviewedSummary("");
    setReviewedRisk("Low");
    clearMessages();
  };

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <main className="new-handoff-page">
      <div className="handoff-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span aria-hidden="true">←</span>
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
        <form
          className="handoff-card"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="handoff-card-header">
            <div>
              <h2>Handoff Information</h2>
              <p>Enter the notes, generate SBAR, and review before saving.</p>
            </div>

            <span className="draft-status-badge">
              <span />
              Draft mode
            </span>
          </div>

          <div className="handoff-divider" />

          <div className="form-group">
            <label htmlFor="patient-select">
              Select Patient <span className="required-star">*</span>
            </label>

            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(event) => {
                setSelectedPatient(event.target.value);
                setSbarResult(null);
                setReviewedSummary("");
                setReviewedRisk("Low");
                clearMessages();
              }}
              disabled={loading || saving || generating}
              required
            >
              <option value="">
                {loading ? "Loading patients..." : "Choose a patient"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={String(patient.id)}>
                  {patient.name} —” Room {patient.room_number || "N/A"}
                </option>
              ))}
            </select>

            <small>
              Select the patient whose care information you are handing over.
            </small>

            {!loading && !error && patients.length === 0 && (
              <div className="handoff-inline-info">
                No assigned active patients are currently available.
              </div>
            )}
          </div>

          {currentPatient && (
            <section className="selected-patient-card">
              <div className="selected-patient-avatar">
                {getInitials(currentPatient.name)}
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
                ✓“
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
                setSbarResult(null);
                setReviewedSummary("");
                setReviewedRisk("Low");
                clearMessages();
              }}
              placeholder="Enter factual nursing observations, available vital signs, ongoing care and pending tasks..."
              rows={10}
              maxLength={10000}
              required
              disabled={saving || generating}
            />

            <small>
              Include relevant observations, ongoing treatment and pending care
              tasks. Do not include information that is not verified.
            </small>
          </div>

          <div className="voice-section">
            <div className="voice-icon" aria-hidden="true">
              Mic
            </div>

            <div className="voice-description">
              <strong>Voice-assisted documentation</strong>
              <span>
                Voice input is planned but has not been implemented yet.
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
              <span aria-hidden="true">✓“</span>
              {message}
            </div>
          )}

          {sbarResult && (
            <section className="sbar-result" aria-live="polite">
              <h2>AI-Generated SBAR Draft</h2>

              <p className="sbar-review-notice">
                AI-generated draft only. Verify every detail against the
                clinical record and follow your facility's procedures.
              </p>

              <div className="sbar-section">
                <label htmlFor="reviewed-sbar">
                  Review and edit SBAR summary
                </label>
                <textarea
                  id="reviewed-sbar"
                  value={reviewedSummary}
                  onChange={(event) => setReviewedSummary(event.target.value)}
                  rows={10}
                  required
                  disabled={saving}
                />
              </div>

              <div className="sbar-section">
                <label htmlFor="reviewed-risk">
                  AI-suggested risk level —” verify before saving
                </label>

                <select
                  id="reviewed-risk"
                  value={reviewedRisk}
                  onChange={(event) => setReviewedRisk(event.target.value)}
                  disabled={saving}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="handoff-actions">
                <button
                  type="button"
                  className="save-draft-button"
                  onClick={() => handleConfirmAndSave("Draft")}
                  disabled={
                    saving ||
                    generating ||
                    !reviewedSummary.trim() ||
                    !handoffText.trim()
                  }
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  className="generate-button"
                  onClick={() => handleConfirmAndSave("Submitted")}
                  disabled={
                    saving ||
                    generating ||
                    !reviewedSummary.trim() ||
                    !handoffText.trim()
                  }
                >
                  {saving ? "Submitting..." : "Submit Handoff"}
                </button>
              </div>
            </section>
          )}

          <div className="handoff-actions">
            <button
              type="button"
              className="draft-button"
              onClick={handleClearNotes}
              disabled={
                saving ||
                generating ||
                (!handoffText && !error && !message && !sbarResult)
              }
            >
              Clear Notes
            </button>

            <button
              type="button"
              className="generate-button"
              onClick={handlePrepareHandoff}
              disabled={
                saving ||
                generating ||
                loading ||
                patients.length === 0 ||
                !handoffText.trim()
              }
            >
              {generating ? "Generating SBAR..." : "Prepare Handoff"}
              <span aria-hidden="true">←’</span>
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

          <div className="guidance-divider" />

          <ul className="guidance-list">
            <li><span>✓“</span> Current patient condition</li>
            <li><span>✓“</span> Relevant observations and vital signs</li>
            <li><span>✓“</span> Medications and ongoing treatment</li>
            <li><span>✓“</span> Pending tasks and follow-up</li>
            <li><span>✓“</span> Important risks and concerns</li>
          </ul>

          <div className="guidance-reminder">
            <strong>Remember</strong>
            <p>
              Verify clinical details and follow your facility's approved
              handoff procedures. AI-generated content must be reviewed by a
              qualified clinician.
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

