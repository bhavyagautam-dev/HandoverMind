
import { useCallback, useEffect, useState } from "react";
import "./IncomingHandoffInbox.css";

const API_BASE = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access") ||
    sessionStorage.getItem("access_token")
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function getRiskClass(risk) {
  return String(risk || "Low").toLowerCase();
}

function IncomingHandoffInbox() {
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const token = getAccessToken();

    if (!token) {
      setError("Login session nahi mili. Logout karke dobara login karein.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/handoffs/inbox/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Inbox load nahi hua. Backend API aur permissions check karein."
        );
      }

      setHandoffs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Inbox load karte waqt error aaya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  async function acknowledgeHandoff(handoffId) {
    const token = getAccessToken();

    if (!token) {
      setError("Login session expire ho gayi. Dobara login karein.");
      return;
    }

    setAcknowledgingId(handoffId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/handoffs/${handoffId}/acknowledge/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || "Handoff acknowledge nahi hua."
        );
      }

      setHandoffs((previous) =>
        previous.map((handoff) =>
          handoff.id === handoffId
            ? {
                ...handoff,
                ...data,
                status: data.status || "Acknowledged",
                acknowledged_at:
                  data.acknowledged_at || new Date().toISOString(),
              }
            : handoff
        )
      );

      setSuccess("Handoff successfully acknowledged.");
    } catch (err) {
      setError(err.message || "Acknowledgement failed.");
    } finally {
      setAcknowledgingId(null);
    }
  }

  return (
    <main className="incoming-inbox">
      <header className="inbox-header">
        <div>
          <span className="inbox-eyebrow">NURSING WORKSPACE</span>
          <h1>Incoming Handoff Inbox</h1>
          <p>
            Patient information aur previous nurse ka SBAR review karke
            handoff acknowledge karein.
          </p>
        </div>

        <button
          type="button"
          className="inbox-refresh-btn"
          onClick={loadInbox}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh Inbox"}
        </button>
      </header>

      {error && (
        <div className="inbox-message error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="inbox-message success" role="status">
          {success}
        </div>
      )}

      <section className="inbox-summary-bar">
        <div>
          <span className="summary-label">Incoming handoffs</span>
          <strong>{handoffs.length}</strong>
        </div>
        <p>Review all handoff details before acknowledging.</p>
      </section>

      {loading ? (
        <div className="inbox-loading">
          <span className="inbox-spinner" />
          <p>Loading incoming handoffs...</p>
        </div>
      ) : handoffs.length === 0 ? (
        <div className="inbox-empty">
          <div className="inbox-empty-icon">✓</div>
          <h2>No incoming handoffs</h2>
          <p>
            Abhi tumhare account ke liye koi submitted handoff available nahi
            hai.
          </p>
          <button
            type="button"
            className="inbox-refresh-btn"
            onClick={loadInbox}
          >
            Refresh Inbox
          </button>
        </div>
      ) : (
        <section className="inbox-list">
          {handoffs.map((handoff) => {
            const acknowledged = handoff.status === "Acknowledged";
            const risk = getRiskClass(handoff.risk_level);

            return (
              <article className="inbox-card" key={handoff.id}>
                <div className="inbox-card-topline">
                  <span className="inbox-record-label">
                    PATIENT HANDOFF
                  </span>

                  <span className={`inbox-risk ${risk}`}>
                    {handoff.risk_level || "Low"} Risk
                  </span>
                </div>

                <div className="inbox-card-header">
                  <div>
                    <h2>{handoff.patient_name || "Patient"}</h2>
                    <p>
                      ID: {handoff.patient_id || handoff.patient || "N/A"}
                      {" · "}
                      Room: {handoff.room_number || "N/A"}
                    </p>
                  </div>

                  <span
                    className={`inbox-status ${
                      acknowledged ? "acknowledged" : ""
                    }`}
                  >
                    {handoff.status || "Submitted"}
                  </span>
                </div>

                <div className="inbox-patient-details">
                  <div className="inbox-detail">
                    <span>Age</span>
                    <strong>{handoff.age ?? "—"}</strong>
                  </div>

                  <div className="inbox-detail">
                    <span>Gender</span>
                    <strong>{handoff.gender || "—"}</strong>
                  </div>

                  <div className="inbox-detail">
                    <span>Diagnosis</span>
                    <strong>{handoff.diagnosis || "Not recorded"}</strong>
                  </div>

                  <div className="inbox-detail">
                    <span>Allergies</span>
                    <strong>{handoff.allergies || "Not recorded"}</strong>
                  </div>
                </div>

                <section className="inbox-section">
                  <div className="inbox-section-heading">
                    <span className="inbox-section-icon">✦</span>
                    <h3>SBAR Summary</h3>
                  </div>

                  <div className="inbox-sbar-content">
                    {handoff.sbar_summary ? (
                      <p>{handoff.sbar_summary}</p>
                    ) : (
                      <p className="inbox-muted">
                        SBAR summary available nahi hai.
                      </p>
                    )}
                  </div>
                </section>

                <section className="inbox-section">
                  <div className="inbox-section-heading">
                    <span className="inbox-section-icon">▤</span>
                    <h3>Original Nurse Notes</h3>
                  </div>

                  <div className="inbox-notes-content">
                    <p>
                      {handoff.input_text || "Original notes available nahi hain."}
                    </p>
                  </div>
                </section>

                <div className="inbox-meta">
                  <span>
                    <strong>Sent by:</strong>{" "}
                    {handoff.outgoing_nurse_username ||
                      handoff.nurse_username ||
                      "Nurse"}
                  </span>
                  <span>
                    <strong>Submitted:</strong>{" "}
                    {formatDate(handoff.created_at)}
                  </span>
                </div>

                {acknowledged && handoff.acknowledged_at && (
                  <div className="inbox-acknowledged-info">
                    ✓ Acknowledged on {formatDate(handoff.acknowledged_at)}
                  </div>
                )}

                <footer className="inbox-card-footer">
                  <span className="inbox-footer-note">
                    {acknowledged
                      ? "Handoff acknowledgement recorded"
                      : "Review details before acknowledgement"}
                  </span>

                  {acknowledged ? (
                    <span className="acknowledged-label">
                      ✓ Acknowledged
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="acknowledge-btn"
                      disabled={acknowledgingId === handoff.id}
                      onClick={() => acknowledgeHandoff(handoff.id)}
                    >
                      {acknowledgingId === handoff.id
                        ? "Acknowledging..."
                        : "Acknowledge Handoff →"}
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default IncomingHandoffInbox;
