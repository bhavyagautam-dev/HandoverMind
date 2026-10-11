import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NurseManagement.css";

function NurseManagement() {
  const navigate = useNavigate();

  const [nurses, setNurses] = useState([]);
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

  const loadNurses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/nurses/",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load nurses."
        );
      }

      setNurses(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storage = getStorage();
    const savedUser = storage.getItem("user");

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

    loadNurses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateNurse = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/nurses/",
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
            : "Unable to create nurse.";

        throw new Error(details);
      }

      setMessage("Nurse account created successfully.");
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
      });
      setShowForm(false);
      await loadNurses();
    } catch (err) {
      setError(err.message || "Unable to create nurse.");
    }
  };

  const handleDeactivate = async (nurseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this nurse account?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/nurses/${nurseId}/`,
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
            "Unable to deactivate nurse."
        );
      }

      setMessage(data.message || "Nurse account deactivated.");
      await loadNurses();
    } catch (err) {
      setError(err.message || "Unable to deactivate nurse.");
    }
  };

  return (
    <div className="nurse-management">
      <header className="nm-header">
        <div>
          <p className="nm-eyebrow">MANAGER PORTAL</p>
          <h1>Nurse Management</h1>
          <p className="nm-subtitle">
            Create and manage nurse accounts.
          </p>
        </div>

        <button
          className="nm-back-button"
          onClick={() => navigate("/manager")}
        >
          ← Dashboard
        </button>
      </header>

      <section className="nm-toolbar">
        <div>
          <h2>Nurses</h2>
          <p>{nurses.length} active nurse account(s)</p>
        </div>

        <button
          className="nm-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Nurse"}
        </button>
      </section>

      {message && (
        <div className="nm-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="nm-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <form className="nm-form" onSubmit={handleCreateNurse}>
          <h2>Create Nurse Account</h2>

          <div className="nm-form-grid">
            <label>
              Username *
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
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

          <button className="nm-primary-button" type="submit">
            Create Account
          </button>
        </form>
      )}

      <section className="nm-table-card">
        {loading ? (
          <p className="nm-empty">Loading nurses...</p>
        ) : nurses.length === 0 ? (
          <p className="nm-empty">No active nurses found.</p>
        ) : (
          <div className="nm-table-wrapper">
            <table className="nm-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {nurses.map((nurse) => (
                  <tr key={nurse.id}>
                    <td>{nurse.username}</td>
                    <td>
                      {[nurse.first_name, nurse.last_name]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td>
                      <button
                        className="nm-deactivate-button"
                        onClick={() => handleDeactivate(nurse.id)}
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

export default NurseManagement;