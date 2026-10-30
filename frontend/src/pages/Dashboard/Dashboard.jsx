
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000/api/patients/";

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

function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    sessionStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        setPatientsError("");

        const token = getAccessToken();

        if (!token) {
          if (!cancelled) {
            setPatientsError("Login session missing. Please log in again.");
            setPatients([]);
          }
          return;
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (!cancelled) {
            setPatientsError(
              data.detail || "Unable to load patients."
            );
            setPatients([]);
          }
          return;
        }

        const patientList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : null;

        if (!patientList) {
          if (!cancelled) {
            setPatientsError("Unexpected patients response format.");
            setPatients([]);
          }
          return;
        }

        if (!cancelled) {
          setPatients(patientList);
        }
      } catch (error) {
        console.error("Patients API error:", error);

        if (!cancelled) {
          setPatientsError("Unable to connect to backend.");
          setPatients([]);
        }
      } finally {
        if (!cancelled) {
          setPatientsLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  const handleLogout = () => {
    const keys = [
      "access",
      "refresh",
      "access_token",
      "refresh_token",
      "user",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setUser(null);
    navigate("/", { replace: true });
  };

  if (!user) {
    return null;
  }

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  );

  const openPatientDetails = (patient) => {
    if (!patient?.id) {
      setPatientsError("Patient database ID is missing.");
      return;
    }

    navigate(`/patients/${patient.id}`);
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">+</div>
          <h2>HandoverMind</h2>
        </div>

        <nav className="sidebar-menu">
          <button className="menu-item active">Dashboard</button>

          <button
            className="menu-item"
            onClick={() => navigate("/patients")}
          >
            Patients
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/new-handoff")}
          >
            New Handoff
          </button>

          <button
            className="menu-item"
            onClick={() => navigate("/handoff-history")}
          >
            Handoff History
          </button>
          <button
              className="menu-item"
              onClick={() => navigate("/incoming-handoffs")}
            >
              Incoming Handoff Inbox
            </button>
          <button className="menu-item">Risk Alerts</button>
        </nav>

        <div className="sidebar-bottom">
          <button className="menu-item">Settings</button>

          <button className="menu-item logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Good Morning, {user.username} 👋</h1>
            <p>Here's your handoff overview for today.</p>
          </div>

          <div className="user-info">
            <div className="notification">🔔</div>

            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.username}</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">♟</div>
            <div>
              <p>Total Patients</p>
              <h2>{patients.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">●</div>
            <div>
              <p>Active Patients</p>
              <h2>{activePatients.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <div>
              <p>Pending Handoffs</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠</div>
            <div>
              <p>High Risk Patients</p>
              <h2>0</h2>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>Patients</h2>
                <p>Recently monitored patients</p>
              </div>

              <button onClick={() => navigate("/patients")}>
                View All
              </button>
            </div>

            <div className="patient-list">
              {patientsLoading && <p>Loading patients...</p>}

              {!patientsLoading && patientsError && (
                <p className="patients-error">{patientsError}</p>
              )}

              {!patientsLoading &&
                !patientsError &&
                patients.length === 0 && (
                  <p>No assigned patients found.</p>
                )}

              {!patientsLoading &&
                !patientsError &&
                patients.map((patient) => (
                  <div className="patient-row" key={patient.id}>
                    <div className="patient-avatar">
                      {(patient.name || "?")
                        .split(" ")
                        .map((word) => word[0] || "")
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="patient-info">
                      <strong>{patient.name}</strong>
                      <span>
                        Room {patient.room_number} {" • "}
                        {patient.age} years
                      </span>
                    </div>

                    <span className="risk low">
                      {patient.status || "Active"}
                    </span>

                    <button
                      className="view-patient-button"
                      onClick={() => openPatientDetails(patient)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>Risk Alerts</h2>
                <p>Patients requiring attention</p>
              </div>
              <button>View All</button>
            </div>

            <div className="risk-alerts">
              <div className="alert high-alert">
                <span>⚠</span>
                <div>
                  <strong>No high risk alerts</strong>
                  <p>Risk analysis will appear here.</p>
                </div>
              </div>

              <div className="alert medium-alert">
                <span>!</span>
                <div>
                  <strong>Risk system pending</strong>
                  <p>AI risk analysis will be added later.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-card handoff-card">
          <div className="card-header">
            <div>
              <h2>Recent Handoffs</h2>
              <p>Latest nurse handoff records</p>
            </div>

            <button onClick={() => navigate("/handoff-history")}>
              View History
            </button>
          </div>

          <div className="handoff-table">
            <div className="table-header">
              <span>Patient</span>
              <span>Date</span>
              <span>Risk Level</span>
              <span>Status</span>
            </div>

            <div className="table-row">
              <span>No handoffs yet</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
