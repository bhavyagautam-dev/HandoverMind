import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./HandoffDetails.css";

function HandoffDetails() {
  const { handoffId } = useParams();
  const navigate = useNavigate();

  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHandoff = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/handoffs/${handoffId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Unable to load handoff.");
          return;
        }

        setHandoff(data);
      } catch (err) {
        console.error("Error loading handoff:", err);
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchHandoff();
  }, [handoffId, navigate]);

  if (loading) {
    return <div className="handoff-details-page">Loading handoff...</div>;
  }

  if (error) {
    return (
      <div className="handoff-details-page">
        <button onClick={() => navigate("/handoff-history")}>
          ← Back to History
        </button>
        <p>{error}</p>
      </div>
    );
  }

  if (!handoff) {
    return null;
  }

  return (
    <main className="handoff-details-page">
      <button
        className="details-back-button"
        onClick={() => navigate("/handoff-history")}
      >
        ← Back to History
      </button>

      <header className="details-header">
        <div>
          <p className="details-eyebrow">CARE DOCUMENTATION</p>
          <h1>Handoff Details</h1>
          <p>Review the saved patient handoff record.</p>
        </div>

        <span
          className={`details-status ${
            (handoff.status || "Draft").toLowerCase()
          }`}
        >
          {handoff.status || "Draft"}
        </span>
      </header>

      <section className="details-card">
        <h2>Patient Information</h2>

        <div className="details-grid">
          <div>
            <span>Patient Name</span>
            <strong>{handoff.patient_name || "N/A"}</strong>
          </div>

          <div>
            <span>Room Number</span>
            <strong>{handoff.room_number || "N/A"}</strong>
          </div>

          <div>
            <span>Patient ID</span>
            <strong>{handoff.patient ?? "N/A"}</strong>
          </div>

          <div>
            <span>Date & Time</span>
            <strong>
              {handoff.created_at
                ? new Date(handoff.created_at).toLocaleString("en-IN")
                : "N/A"}
            </strong>
          </div>
        </div>
      </section>

      <section className="details-card">
        <h2>Risk Assessment</h2>

        <p>
          Risk Level:{" "}
          <strong>{handoff.risk_level || "Not assessed"}</strong>
        </p>
        <p>
          Status: <strong>{handoff.status || "Draft"}</strong>
        </p>
      </section>

      <section className="details-card">
        <h2>Original Handoff Notes</h2>

        <div className="details-text">
          {handoff.input_text || "No handoff notes available."}
        </div>
      </section>

      <section className="details-card">
        <h2>SBAR Summary</h2>

        <div className="details-text">
          {handoff.sbar_summary || "SBAR summary has not been generated yet."}
        </div>
      </section>
    </main>
  );
}

export default HandoffDetails;
