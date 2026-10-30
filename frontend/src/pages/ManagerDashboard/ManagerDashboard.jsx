import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManagerDashboard.css";

const navItems = [
  { icon: "▦", label: "Dashboard", path: "/manager" },
  { icon: "🛏️", label: "Patient Management", path: "/patient-management" },
  { icon: "🩺", label: "Nurse Management", path: "/manager/nurses" },
  { icon: "👥", label: "Staff Management", path: "/manager/staff" },
  { icon: "📋", label: "Patient Assignments", path: "/manager/assignments" },
];

const quickActions = [
  {
    icon: "🛏️",
    title: "Patient management",
    text: "Add, edit or discharge patient records.",
    path: "/patient-management",
    tone: "blue",
  },
  {
    icon: "🩺",
    title: "Nurse accounts",
    text: "Add, edit or review nurse accounts.",
    path: "/manager/nurses",
    tone: "green",
  },
  {
    icon: "👥",
    title: "Staff accounts",
    text: "Manage non-medical staff members.",
    path: "/manager/staff",
    tone: "purple",
  },
  {
    icon: "📋",
    title: "Assignments",
    text: "Assign patients to available nurses.",
    path: "/manager/assignments",
    tone: "orange",
  },
];

function ManagerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    activeNurses: 0,
    nonMedicalStaff: 0,
    pendingAssignments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStorage = () =>
    localStorage.getItem("user") ? localStorage : sessionStorage;

  const getToken = () => {
    if (localStorage.getItem("access_token")) {
      return localStorage.getItem("access_token");
    }

    return sessionStorage.getItem("access_token");
  };

  useEffect(() => {
    const savedUser = getStorage().getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.role !== "Manager") {
        navigate("/dashboard");
        return;
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!menuOpen) return;

    const handleKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Stop the page behind the menu from scrolling while it is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!user || user.role !== "Manager") return;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${getToken()}`,
      };

      try {
        const [patientsResponse, nursesResponse, staffResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/api/patients/", { headers }),
            fetch("http://127.0.0.1:8000/api/nurses/", { headers }),
            fetch("http://127.0.0.1:8000/api/staff/", { headers }),
          ]);

        const [patientsData, nursesData, staffData] = await Promise.all([
          patientsResponse.json(),
          nursesResponse.json(),
          staffResponse.json(),
        ]);

        if (
          !patientsResponse.ok ||
          !nursesResponse.ok ||
          !staffResponse.ok
        ) {
          throw new Error(
            "Could not load dashboard statistics. Please check the API permissions."
          );
        }

        const patients = Array.isArray(patientsData)
          ? patientsData
          : patientsData.results || [];

        const nurses = Array.isArray(nursesData)
          ? nursesData
          : nursesData.results || [];

        const staff = Array.isArray(staffData)
          ? staffData
          : staffData.results || [];

        const activePatients = patients.filter(
          (patient) => patient.status === "Active"
        );

        setStats({
          totalPatients: patients.length,
          activePatients: activePatients.length,
          activeNurses: nurses.length,
          nonMedicalStaff: staff.length,
          pendingAssignments: activePatients.filter(
            (patient) => patient.assigned_nurse == null
          ).length,
        });
      } catch (err) {
        setError(err.message || "Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  if (!user || user.role !== "Manager") {
    return null;
  }

  const assignedPatients = Math.max(
    stats.activePatients - stats.pendingAssignments,
    0
  );
  const coverage =
    stats.activePatients > 0
      ? Math.round((assignedPatients / stats.activePatients) * 100)
      : 0;

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
      value: stats.totalPatients,
      note: `${stats.activePatients} currently active`,
      tone: "blue",
    },
    {
      icon: "🩺",
      label: "Active Nurses",
      value: stats.activeNurses,
      note: "Registered nurse accounts",
      tone: "green",
    },
    {
      icon: "👥",
      label: "Non-medical Staff",
      value: stats.nonMedicalStaff,
      note: "Support team members",
      tone: "purple",
    },
    {
      icon: "📋",
      label: "Pending Assignments",
      value: stats.pendingAssignments,
      note:
        stats.pendingAssignments > 0
          ? "Need a nurse assigned"
          : "All patients assigned",
      tone: "orange",
    },
  ];

  return (
    <div className="manager-layout">
      <div
        className={`manager-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="manager-sidebar"
        className={`manager-sidebar ${menuOpen ? "open" : ""}`}
      >
        <button
          className="manager-sidebar-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="manager-brand">
          <span className="manager-brand-icon">✚</span>
          <div>
            <h2>
              Handover<span>Mind</span>
            </h2>
            <p>Manager Portal</p>
          </div>
        </div>

        <span className="manager-nav-label">MENU</span>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={item.path === "/manager" ? "active" : ""}
              onClick={() => goTo(item.path)}
            >
              <span className="manager-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="manager-sidebar-bottom">
          <div className="manager-sidebar-user">
            <span className="manager-avatar manager-avatar-small">
              {user.username?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.username}</strong>
              <p>Manager</p>
            </div>
          </div>

          <button className="manager-logout" onClick={handleLogout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="manager-main">
        <header className="manager-header">
          <div className="manager-header-left">
            <button
              className="manager-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="manager-sidebar"
            >
              <span />
              <span />
              <span />
            </button>

            <div>
              <span className="manager-date">{today}</span>
              <h1>Hospital overview</h1>
            </div>
          </div>

          <div className="manager-profile">
            <span className="manager-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.username}</strong>
              <p>Manager</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="manager-error" role="alert">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <section className="manager-hero">
          <div className="manager-hero-circle manager-hero-circle-one" />
          <div className="manager-hero-circle manager-hero-circle-two" />

          <div className="manager-hero-content">
            <span className="manager-hero-kicker">
              <span className="manager-hero-dot" />
              WELCOME BACK
            </span>
            <h2>Hello, {user.username} 👋</h2>
            <p>
              Manage patients, nurse accounts, staff accounts and patient
              assignments from one place.
            </p>

            <button
              className="manager-hero-button"
              onClick={() => navigate("/manager/assignments")}
            >
              Manage assignments <span>→</span>
            </button>
          </div>

          <div className="manager-hero-symbol" aria-hidden="true">
            <div className="manager-hero-ring" />
            <div className="manager-hero-center">✚</div>
          </div>
        </section>

        {!loading && !error && stats.pendingAssignments > 0 && (
          <div className="manager-alert">
            <span className="manager-alert-icon">🔔</span>
            <p>
              <strong>{stats.pendingAssignments}</strong> active{" "}
              {stats.pendingAssignments === 1 ? "patient is" : "patients are"}{" "}
              waiting for a nurse assignment.
            </p>
            <button onClick={() => navigate("/manager/assignments")}>
              Assign now →
            </button>
          </div>
        )}

        <section className="manager-stats">
          {statCards.map((card, index) => (
            <article
              key={card.label}
              className={`manager-stat-card manager-tone-${card.tone}`}
              style={{ "--manager-index": index }}
            >
              <span className="manager-stat-icon">{card.icon}</span>
              <p>{card.label}</p>
              <h2>{loading ? "..." : card.value}</h2>
              <small>{loading ? "Loading..." : card.note}</small>
            </article>
          ))}
        </section>

        <section className="manager-grid">
          <article className="manager-panel">
            <div className="manager-panel-head">
              <div>
                <span className="manager-kicker">COVERAGE</span>
                <h3>Patient assignment status</h3>
              </div>
              <strong className="manager-percent">
                {loading ? "..." : `${coverage}%`}
              </strong>
            </div>

            <div className="manager-progress">
              <div
                className="manager-progress-bar"
                style={{ width: `${loading ? 0 : coverage}%` }}
              />
            </div>

            <div className="manager-progress-legend">
              <div>
                <span className="manager-legend-dot manager-legend-green" />
                Assigned
                <strong>{loading ? "..." : assignedPatients}</strong>
              </div>
              <div>
                <span className="manager-legend-dot manager-legend-orange" />
                Pending
                <strong>{loading ? "..." : stats.pendingAssignments}</strong>
              </div>
              <div>
                <span className="manager-legend-dot manager-legend-blue" />
                Active patients
                <strong>{loading ? "..." : stats.activePatients}</strong>
              </div>
            </div>
          </article>

          <article className="manager-panel manager-panel-note">
            <span className="manager-note-icon">✦</span>
            <h3>Keep handoffs smooth</h3>
            <p>
              When every active patient has an assigned nurse, shift handoffs
              stay clear and nothing gets missed between teams.
            </p>
          </article>
        </section>

        <section className="manager-quick">
          <div className="manager-section-title">
            <span className="manager-kicker">QUICK ACTIONS</span>
            <h3>Jump to where you need to be</h3>
          </div>

          <div className="manager-quick-grid">
            {quickActions.map((action, index) => (
              <button
                key={action.path}
                className="manager-quick-card"
                style={{ "--manager-index": index }}
                onClick={() => navigate(action.path)}
              >
                <span
                  className={`manager-quick-icon manager-tone-${action.tone}`}
                >
                  {action.icon}
                </span>
                <h4>{action.title}</h4>
                <p>{action.text}</p>
                <span className="manager-quick-arrow">↗</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;