import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffManagement.css";

function StaffManagement() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const getStorage = () =>
    localStorage.getItem("access_token")
      ? localStorage
      : sessionStorage;

  const getToken = () =>
    getStorage().getItem("access_token");

  const loadStaff = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/staff/",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load staff accounts."
        );
      }

      setStaff(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = getStorage().getItem("user");

    if (!savedUser) {
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "Manager" && user.role !== "Admin") {
        navigate("/dashboard");
        return;
      }
    } catch {
      navigate("/");
      return;
    }

    loadStaff();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/staff/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const details =
          typeof data === "object"
            ? Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" | ")
            : "Unable to create staff account.";

        throw new Error(details);
      }

      setMessage("Staff account created successfully.");
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
      });

      setShowForm(false);
      await loadStaff();
    } catch (err) {
      setError(err.message || "Unable to create staff account.");
    }
  };

  const handleDeactivate = async (staffId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this staff account?"
      )
    ) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/staff/${staffId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to deactivate staff account."
        );
      }

      setMessage(
        data.message || "Staff account deactivated successfully."
      );

      await loadStaff();
    } catch (err) {
      setError(
        err.message || "Unable to deactivate staff account."
      );
    }
  };

  return (
    <div className="staff-management">
      <header className="sm-header">
        <div>
          <p className="sm-eyebrow">MANAGER PORTAL</p>
          <h1>Staff Management</h1>
          <p className="sm-subtitle">
            Manage non-medical staff accounts.
          </p>
        </div>

        <button
          className="sm-back-button"
          onClick={() => navigate("/manager")}
        >
          ← Dashboard
        </button>
      </header>

      <section className="sm-toolbar">
        <div>
          <h2>Non-medical Staff</h2>
          <p>{staff.length} active staff account(s)</p>
        </div>

        <button
          className="sm-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </section>

      {message && (
        <div className="sm-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="sm-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <form className="sm-form" onSubmit={handleCreateStaff}>
          <h2>Create Staff Account</h2>

          <div className="sm-form-grid">
            <label>
              Username *
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </label>

            <label>
              First Name
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Last Name
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Password *
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <button
            className="sm-primary-button"
            type="submit"
          >
            Create Account
          </button>
        </form>
      )}

      <section className="sm-table-card">
        {loading ? (
          <p className="sm-empty">Loading staff accounts...</p>
        ) : staff.length === 0 ? (
          <p className="sm-empty">
            No active staff accounts found.
          </p>
        ) : (
          <div className="sm-table-wrapper">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>{member.username}</td>
                    <td>
                      {[member.first_name, member.last_name]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td>
                      <button
                        className="sm-deactivate-button"
                        onClick={() =>
                          handleDeactivate(member.id)
                        }
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffManagement;
