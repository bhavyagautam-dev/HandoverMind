import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HandoffHistory.css";

function HandoffHistory() {
  const navigate = useNavigate();

  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchHandoffs = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

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

        if (!Array.isArray(data)) {
          setError("Unexpected handoff data received from the server.");
          return;
        }

        setHandoffs(data);
      } catch (err) {
        console.error("Error loading handoffs:", err);
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchHandoffs();
  }, [navigate]);

  const filteredHandoffs = useMemo(() => {
    return handoffs.filter((handoff) => {
      const patientName = String(handoff.patient_name || "").toLowerCase();
      const patientId = String(handoff.patient || "").toLowerCase();
      const roomNumber = String(handoff.room_number || "").toLowerCase();
      const query = search.trim().toLowerCase();

      const matchesSearch =
        patientName.includes(query) ||
        patientId.includes(query) ||
        roomNumber.includes(query);

      const status = String(handoff.status || "Unknown").toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [handoffs, search, statusFilter]);

  const draftCount = handoffs.filter(
    (handoff) =>
      String(handoff.status || "").toLowerCase() === "draft"
  ).length;

  const submittedCount = handoffs.filter(
    (handoff) =>
      String(handoff.status || "").toLowerCase() === "submitted"
  ).length;

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusClass = (status) => {
    const normalized = String(status || "unknown").toLowerCase();

    if (normalized === "draft") return "draft";
    if (normalized === "submitted") return "submitted";

    return "unknown";
  };

  const getRiskClass = (risk) => {
    const normalized = String(risk || "").toLowerCase();

    if (normalized === "low") return "low";
    if (normalized === "medium") return "medium";
    if (normalized === "high") return "high";
    if (normalized === "critical") return "critical";

    return "unknown";
  };

  return (
    <main className="handoff-history-page">
      <div className="history-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <span className="history-breadcrumb">
          HandoverMind <span>/</span> Handoff History
        </span>
      </div>

      <header className="history-header">
        <div className="history-heading-content">
          <span className="history-eyebrow">CARE DOCUMENTATION</span>
          <h1>Handoff History</h1>
          <p>
            Review and track your previous patient handoff records.
          </p>
        </div>

        <button
          type="button"
          className="new-handoff-button"
          onClick={() => navigate("/new-handoff")}
        >
          <span aria-hidden="true">+</span>
          New Handoff
        </button>
      </header>

      <section className="history-stats">
        <div className="history-stat-card">
          <div className="history-stat-icon total-icon">H</div>
          <div>
            <span>Total Handoffs</span>
            <strong>{loading ? "—" : handoffs.length}</strong>
            <small>All available records</small>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon draft-icon">D</div>
          <div>
            <span>Draft Handoffs</span>
            <strong>{loading ? "—" : draftCount}</strong>
            <small>Saved as drafts</small>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon submitted-icon">✓</div>
          <div>
            <span>Submitted Handoffs</span>
            <strong>{loading ? "—" : submittedCount}</strong>
            <small>Marked as submitted</small>
          </div>
        </div>
      </section>

      <section className="history-card">
        <div className="history-card-heading">
          <div>
            <h2>Handoff Records</h2>
            <p>Search and filter your available records.</p>
          </div>

          <span className="history-record-count">
            {loading ? "Loading..." : `${filteredHandoffs.length} records`}
          </span>
        </div>

        <div className="history-toolbar">
          <div className="history-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search patient, ID or room..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search handoff records"
            />

            {search && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="history-filter">
            <label htmlFor="status-filter">Status</label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="history-state">
            <div className="history-loader"></div>
            <h3>Loading handoff records</h3>
            <p>Please wait while we retrieve your records.</p>
          </div>
        )}

        {!loading && error && (
          <div className="history-state">
            <div className="history-state-icon error-icon">!</div>
            <h3>Unable to load handoffs</h3>
            <p>{error}</p>

            <button
              type="button"
              className="history-retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && handoffs.length === 0 && (
          <div className="history-state">
            <div className="history-state-icon">H</div>
            <h3>No handoffs yet</h3>
            <p>
              Your saved handoff records will appear here once available.
            </p>

            <button
              type="button"
              className="history-retry-button"
              onClick={() => navigate("/new-handoff")}
            >
              Create New Handoff
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          handoffs.length > 0 &&
          filteredHandoffs.length === 0 && (
            <div className="history-state compact-state">
              <div className="history-state-icon">⌕</div>
              <h3>No matching records</h3>
              <p>Try another search term or change the status filter.</p>

              <button
                type="button"
                className="history-retry-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredHandoffs.length > 0 && (
            <div className="handoff-table-wrapper">
              <div className="handoff-table">
                <div className="table-header">
                  <span>Patient</span>
                  <span>Date & Time</span>
                  <span>Risk Level</span>
                  <span>Status</span>
                </div>

                {filteredHandoffs.map((handoff) => {
                  const risk = handoff.risk_level;
                  const status = handoff.status || "Unknown";

                  return (
                    <div className="table-row" key={handoff.id}>
                      <div className="patient-cell">
                        <div className="history-patient-avatar">
                          {getInitials(handoff.patient_name || "Patient")}
                        </div>

                        <div className="history-patient-info">
                          <strong>
                            {handoff.patient_name || "Unnamed Patient"}
                          </strong>

                          <small>
                            Room {handoff.room_number || "N/A"}
                          </small>
                        </div>
                      </div>

                      <div className="history-date">
                        <strong>{formatDate(handoff.created_at)}</strong>
                      </div>

                      <div>
                        <span
                          className={`risk-badge ${getRiskClass(risk)}`}
                        >
                          <span className="badge-dot"></span>
                          {risk || "Not assessed"}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`status-badge ${getStatusClass(status)}`}
                        >
                          <span className="badge-dot"></span>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </section>

      <footer className="history-footer">
        HandoverMind · Patient care documentation
      </footer>
    </main>
  );
}

export default HandoffHistory;