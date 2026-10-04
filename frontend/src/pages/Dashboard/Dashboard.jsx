import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="dashboard-container">

      <div className="dashboard-card">

        <h1>Welcome, {user.username}</h1>

        <p>
          Role: <strong>{user.role}</strong>
        </p>

        {user.role === "Admin" ? (
          <>
            <h2>Admin Dashboard</h2>

            <div className="dashboard-content">
              <p>Manage Nurses</p>
              <p>Manage Patients</p>
              <p>View All Handoffs</p>
              <p>View Risk Alerts</p>
            </div>
          </>
        ) : user.role === "Nurse" ? (
          <>
            <h2>Nurse Dashboard</h2>

            <div className="dashboard-content">
              <p>My Patients</p>
              <p>Create Handoff</p>
              <p>Voice Handoff</p>
              <p>Handoff History</p>
            </div>
          </>
        ) : (
          <h2>Unknown Role</h2>
        )}

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Dashboard;