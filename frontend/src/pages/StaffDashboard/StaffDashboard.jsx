
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../services/api";
import "./StaffDashboard.css";

const navItems = [
  { icon: "▦", label: "Dashboard", path: "/staff" },
  { icon: "🛏️", label: "Patient Management", path: "/patient-management" },
];

function StaffDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const getStorage = () =>
    localStorage.getItem("user") ? localStorage : sessionStorage;

  const getToken = () =>
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  useEffect(() => {
    const savedUser = getStorage().getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.role !== "Non-medical Staff") {
        navigate("/login", { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== "Non-medical Staff") return;

    const loadPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/patients/`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load patients.");
        }

        const patientList = Array.isArray(data)
          ? data
          : data.results || [];

        setPatients(patientList);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    ["access_token", "refresh_token", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    navigate("/login", { replace: true });
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  if (!user || user.role !== "Non-medical Staff") {
    return null;
  }

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  );

  const dischargedPatients = patients.filter(
    (patient) => patient.status === "Discharged"
  );

  const recentPatients = [...patients].slice(-5).reverse();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards = [
    {
      icon: "🛏️",
      label: "Total Patients",
      value: patients.length,
      tone: "blue",
    },
    {
      icon: "🟢",
      label: "Active Patients",
      value: activePatients.length,
      tone: "green",
    },
    {
      icon: "📋",
      label: "Discharged Patients",
      value: dischargedPatients.length,
      tone: "orange",
    },
  ];

  return (
    <div className="staff-layout">
      <div
        className={`staff-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="staff-sidebar"
        className={`staff-sidebar ${menuOpen ? "open" : ""}`}
      >
        <button
          className="staff-sidebar-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="staff-brand">
          <span className="staff-brand-icon">✚</span>
          <div>
            <h2>
              Handover<span>Mind</span>
            </h2>
            <p>Staff Portal</p>
          </div>
        </div>

        <span className="staff-nav-label">MENU</span>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={item.path === "/staff" ? "active" : ""}
              onClick={() => goTo(item.path)}
            >
              <span className="staff-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="staff-sidebar-bottom">
          <div className="staff-sidebar-user">
            <span className="staff-avatar staff-avatar-small">
              {user.username?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.username}</strong>
              <p>Non-medical Staff</p>
            </div>
          </div>

          <button className="staff-logout" onClick={handleLogout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div className="staff-header-left">
            <button
              className="staff-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="staff-sidebar"
            >
              <span />
              <span />
              <span />
            </button>

            <div>
              <span className="staff-date">{today}</span>
              <h1>Staff Dashboard</h1>
            </div>
          </div>

          <div className="staff-profile">
            <span className="staff-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.username}</strong>
              <p>Non-medical Staff</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="staff-error" role="alert">
            {error}
          </div>
        )}

        <section className="staff-hero">
          <div className="staff-hero-circle staff-hero-circle-one" />
          <div className="staff-hero-circle staff-hero-circle-two" />

          <div className="staff-hero-content">
            <span className="staff-hero-kicker">
              <span className="staff-hero-dot" />
              STAFF WORKSPACE
            </span>

            <h2>Hello, {user.username} 👋</h2>

            <p>
              Manage patient records and keep hospital information
              accurate and up to date.
            </p>

            <button
              className="staff-hero-button"
              onClick={() => navigate("/patient-management")}
            >
              Manage patients <span>→</span>
            </button>
          </div>

          <div className="staff-hero-symbol" aria-hidden="true">
            <div className="staff-hero-ring" />
            <div className="staff-hero-center">✚</div>
          </div>
        </section>

        <section className="staff-stats">
          {statCards.map((card, index) => (
            <article
              key={card.label}
              className={`staff-stat-card staff-tone-${card.tone}`}
              style={{ "--staff-index": index }}
            >
              <span className="staff-stat-icon">{card.icon}</span>
              <p>{card.label}</p>
              <h2>{loading ? "..." : card.value}</h2>
              <small>
                {loading ? "Loading..." : "Patient records"}
              </small>
            </article>
          ))}
        </section>

        <section className="staff-quick">
          <div className="staff-section-title">
            <span className="staff-kicker">QUICK ACTIONS</span>
            <h3>Manage your daily tasks</h3>
          </div>

          <div className="staff-quick-grid">
            <button
              className="staff-quick-card"
              onClick={() => navigate("/patient-management")}
            >
              <span className="staff-quick-icon staff-tone-blue">
                🛏️
              </span>
              <h4>Patient Management</h4>
              <p>View, add, update and discharge patient records.</p>
              <span className="staff-quick-arrow">↗</span>
            </button>

            <button
              className="staff-quick-card"
              onClick={() => navigate("/patient-management")}
            >
              <span className="staff-quick-icon staff-tone-green">
                ＋
              </span>
              <h4>Register Patient</h4>
              <p>Open patient management to register a new patient.</p>
              <span className="staff-quick-arrow">↗</span>
            </button>
          </div>
        </section>

        <section className="staff-recent">
          <div className="staff-section-title staff-recent-heading">
            <div>
              <span className="staff-kicker">RECENT RECORDS</span>
              <h3>Recent patients</h3>
            </div>

            <button onClick={() => navigate("/patient-management")}>
              View all →
            </button>
          </div>

          {loading ? (
            <p className="staff-empty">Loading patient records...</p>
          ) : recentPatients.length === 0 ? (
            <p className="staff-empty">No patient records found.</p>
          ) : (
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <strong>{patient.name}</strong>
                      </td>
                      <td>{patient.room_number || "—"}</td>
                      <td>
                        <span
                          className={`staff-status ${
                            patient.status === "Discharged"
                              ? "discharged"
                              : "active"
                          }`}
                        >
                          {patient.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StaffDashboard;
