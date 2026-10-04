import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HandoffHistory.css";

function HandoffHistory() {
  const navigate = useNavigate();

  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHandoffs();
  }, []);

  const fetchHandoffs = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/handoffs/",
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
        setError(data.detail || "Unable to load handoffs.");
        return;
      }

      setHandoffs(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="handoff-history-page">

      <div className="history-header">

        <div>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h1>Handoff History</h1>
          <p>View your previous patient handoff records.</p>
        </div>

        <button
          className="new-handoff-button"
          onClick={() => navigate("/new-handoff")}
        >
          + New Handoff
        </button>

      </div>

      <div className="history-card">

        {loading && (
          <p className="history-message">
            Loading handoffs...
          </p>
        )}

        {error && (
          <p className="history-error">
            {error}
          </p>
        )}

        {!loading && !error && handoffs.length === 0 && (
          <div className="empty-history">
            <h2>No Handoffs Yet</h2>
            <p>
              Your saved handoff records will appear here.
            </p>

            <button
              onClick={() => navigate("/new-handoff")}
            >
              Create New Handoff
            </button>
          </div>
        )}

        {!loading && !error && handoffs.length > 0 && (
          <div className="handoff-table">

            <div className="table-header">
              <span>Patient</span>
              <span>Date</span>
              <span>Risk Level</span>
              <span>Status</span>
            </div>

            {handoffs.map((handoff) => (
              <div
                className="table-row"
                key={handoff.id}
              >

                <div className="patient-cell">
                        <strong>
                            {handoff.patient_name}
                        </strong>

                        <small>
                            Room {handoff.room_number}
                        </small>
                </div>

                <span>
                  {new Date(
                    handoff.created_at
                  ).toLocaleDateString()}
                </span>

                <span
                  className={`risk-badge ${handoff.risk_level.toLowerCase()}`}
                >
                  {handoff.risk_level}
                </span>

                <span
                  className={`status-badge ${handoff.status.toLowerCase()}`}
                >
                  {handoff.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default HandoffHistory;