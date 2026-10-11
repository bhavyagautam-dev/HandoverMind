import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
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
      navigate("/");
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
      navigate("/");
    }
  }, [navigate]);

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
            fetch("http://127.0.0.1:8000/api/patients/", {
              headers,
            }),
            fetch("http://127.0.0.1:8000/api/nurses/", {
              headers,
            }),
            fetch("http://127.0.0.1:8000/api/staff/", {
              headers,
            }),
          ]);

        const [patientsData, nursesData, staffData] =
          await Promise.all([
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

    navigate("/");
  };

  if (!user || user.role !== "Manager") {
    return null;
  }

  return (
    <div className="manager-layout">
      <aside className="manager-sidebar">
        <h2>🏥 HandoverMind</h2>
        <p>Manager Portal</p>

        <nav>
          <button
            className="active"
            onClick={() => navigate("/manager")}
          >
            Dashboard
          </button>

          <button onClick={() => navigate("/patients")}>
            Patients
          </button>

          <button onClick={() => navigate("/manager/nurses")}>
            Nurse Management
          </button>

          <button onClick={() => navigate("/manager/staff")}>
            Staff Management
          </button>

          <button onClick={() => navigate("/manager/assignments")}>
            Patient Assignments
          </button>
        </nav>

        <button
          className="manager-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="manager-main">
        <header className="manager-header">
          <div>
            <h1>Welcome, {user.username} 👋</h1>
            <p>Hospital overview and management</p>
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
            {error}
          </div>
        )}

        <section className="manager-stats">
          <article className="manager-stat-card">
            <span>🛏️</span>
            <p>Total Patients</p>
            <h2>
              {loading ? "..." : stats.totalPatients}
            </h2>
          </article>

          <article className="manager-stat-card">
            <span>🩺</span>
            <p>Active Nurses</p>
            <h2>
              {loading ? "..." : stats.activeNurses}
            </h2>
          </article>

          <article className="manager-stat-card">
            <span>👥</span>
            <p>Non-medical Staff</p>
            <h2>
              {loading ? "..." : stats.nonMedicalStaff}
            </h2>
          </article>

          <article className="manager-stat-card">
            <span>📋</span>
            <p>Pending Assignments</p>
            <h2>
              {loading ? "..." : stats.pendingAssignments}
            </h2>
          </article>
        </section>

        <section className="manager-welcome-card">
          <h2>Hospital Management</h2>
          <p>
            Manage patients, nurse accounts, staff accounts, and
            patient assignments from one place.
          </p>
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;
