import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState("");

  // =========================
  // CHECK LOGIN
  // =========================

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);


  // =========================
  // FETCH PATIENTS
  // =========================

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, []);


  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("access_token");

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
        setPatientsError(
          data.detail || "Unable to load patients"
        );
        return;
      }

      setPatients(data);

    } catch (error) {
      console.error(error);

      setPatientsError(
        "Unable to connect to backend."
      );

    } finally {
      setPatientsLoading(false);
    }
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/");
  };


  if (!user) {
    return null;
  }


  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            +
          </div>

          <h2>
            HandoverMind
          </h2>

        </div>


        <nav className="sidebar-menu">

          <button
            className="menu-item active"
          >
            Dashboard
          </button>


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
          >
            Risk Alerts
          </button>

        </nav>


        <div className="sidebar-bottom">

          <button
            className="menu-item"
          >
            Settings
          </button>


          <button
            className="menu-item logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">

        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div>

            <h1>
              Good Morning, {user.username} 👋
            </h1>

            <p>
              Here's your handoff overview for today.
            </p>

          </div>


          <div className="user-info">

            <div className="notification">
              🔔
            </div>


            <div className="user-avatar">

              {user.username
                .charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <strong>
                {user.username}
              </strong>

              <span>
                {user.role}
              </span>

            </div>

          </div>

        </header>


        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {/* Total Patients */}

          <div className="stat-card">

            <div className="stat-icon blue">
              ♟
            </div>

            <div>

              <p>
                Total Patients
              </p>

              <h2>
                {patients.length}
              </h2>

            </div>

          </div>


          {/* Active Patients */}

          <div className="stat-card">

            <div className="stat-icon green">
              ●
            </div>

            <div>

              <p>
                Active Patients
              </p>

              <h2>
                {patients.length}
              </h2>

            </div>

          </div>


          {/* Pending Handoffs */}

          <div className="stat-card">

            <div className="stat-icon orange">
              ◷
            </div>

            <div>

              <p>
                Pending Handoffs
              </p>

              <h2>
                0
              </h2>

            </div>

          </div>


          {/* High Risk */}

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠
            </div>

            <div>

              <p>
                High Risk Patients
              </p>

              <h2>
                0
              </h2>

            </div>

          </div>

        </section>


        {/* ================= PATIENTS + RISK ================= */}

        <section className="dashboard-grid">


          {/* ================= PATIENTS ================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Patients
                </h2>

                <p>
                  Recently monitored patients
                </p>

              </div>


              <button
                onClick={() => navigate("/patients")}
              >
                View All
              </button>

            </div>


            <div className="patient-list">


              {/* Loading */}

              {patientsLoading && (
                <p>
                  Loading patients...
                </p>
              )}


              {/* Error */}

              {patientsError && (
                <p className="patients-error">
                  {patientsError}
                </p>
              )}


              {/* No patients */}

              {!patientsLoading &&
                !patientsError &&
                patients.length === 0 && (

                  <p>
                    No patients found.
                  </p>

                )}


              {/* REAL PATIENT DATA */}

              {!patientsLoading &&
                !patientsError &&
                patients.map((patient) => (

                  <div
                    className="patient-row"
                    key={patient.id}
                  >


                    {/* Avatar */}

                    <div className="patient-avatar">

                      {patient.name
                        .split(" ")
                        .map(
                          (word) => word[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}

                    </div>


                    {/* Patient Information */}

                    <div className="patient-info">

                      <strong>
                        {patient.name}
                      </strong>

                      <span>
                        Room {patient.room_number}
                        {" • "}
                        {patient.age} years
                      </span>

                    </div>


                    {/* Temporary Risk */}

                    <span className="risk low">
                      Low
                    </span>


                    {/* View Details */}

                    <button
                      className="view-patient-button"
                      onClick={() =>
                        navigate(
                          `/patients/${patient.id}`
                        )
                      }
                    >
                      View Details
                    </button>


                  </div>

                ))}

            </div>

          </div>


          {/* ================= RISK ALERTS ================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Risk Alerts
                </h2>

                <p>
                  Patients requiring attention
                </p>

              </div>


              <button>
                View All
              </button>

            </div>


            <div className="risk-alerts">

              <div className="alert high-alert">

                <span>
                  ⚠
                </span>

                <div>

                  <strong>
                    No high risk alerts
                  </strong>

                  <p>
                    Risk analysis will appear here.
                  </p>

                </div>

              </div>


              <div className="alert medium-alert">

                <span>
                  !
                </span>

                <div>

                  <strong>
                    Risk system pending
                  </strong>

                  <p>
                    AI risk analysis will be added later.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= RECENT HANDOFFS ================= */}

        <section className="dashboard-card handoff-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Handoffs
              </h2>

              <p>
                Latest nurse handoff records
              </p>

            </div>


            <button>
              View History
            </button>

          </div>


          <div className="handoff-table">

            <div className="table-header">

              <span>
                Patient
              </span>

              <span>
                Date
              </span>

              <span>
                Risk Level
              </span>

              <span>
                Status
              </span>

            </div>


            <div className="table-row">

              <span>
                No handoffs yet
              </span>

              <span>
                —
              </span>

              <span>
                —
              </span>

              <span>
                —
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;