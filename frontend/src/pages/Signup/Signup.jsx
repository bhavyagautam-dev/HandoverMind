
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../../services/api";
import "./Signup.css";


function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: "",
    city: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.hospitalName.trim()) {
      setError("Please enter your hospital name.");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError("Please enter the Manager's full name.");
      return;
    }

    if (formData.username.trim().length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const payload = {
      hospital_name: formData.hospitalName.trim(),
      city: formData.city.trim(),
      first_name: firstName,
      last_name: lastName,
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/hospital-register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errors = Object.entries(data)
          .map(([field, value]) => {
            const detail = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${detail}`;
          })
          .join(" | ");

        throw new Error(errors || "Registration failed.");
      }

      setMessage(
        "Hospital registered successfully! Redirecting to login..."
      );

      // Registration does not automatically log in the Manager.
      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
        },
      });

    } catch (err) {
      setError(
        err.message || "Unable to register hospital. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-container">
      <section className="signup-card">

        <Link to="/" className="signup-brand">
          <span className="signup-brand-icon">+</span>
          HandoverMind
        </Link>

        <div className="signup-heading">
          <h1>Register Your Hospital</h1>
          <p>
            Create a hospital account and register its Manager.
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>

          <h3>Hospital Information</h3>

          <div className="signup-field">
            <label htmlFor="hospitalName">Hospital Name</label>
            <input
              id="hospitalName"
              name="hospitalName"
              type="text"
              placeholder="Enter hospital name"
              value={formData.hospitalName}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          <h3>Hospital Manager Information</h3>

          <div className="signup-field">
            <label htmlFor="fullName">Manager Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter Manager's full name"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              minLength={3}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="manager@hospital.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="signup-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="signup-success" role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="signup-submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Hospital"}
          </button>

        </form>

        <div className="signup-footer">
          <p>
            Already registered?{" "}
            <Link to="/" className="signup-login-link">
              Sign in
            </Link>
          </p>
        </div>

      </section>

      <p className="signup-security-note">
        Secure access for healthcare professionals
      </p>
    </main>
  );
}

export default Signup;

