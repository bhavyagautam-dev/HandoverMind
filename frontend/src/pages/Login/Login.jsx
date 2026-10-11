import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );


    const responseText = await response.text();

    console.log("HTTP Status:", response.status);
    console.log("Response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      setMessage(
        "Backend returned HTML instead of JSON. Check the browser console and Django terminal."
      );
      return;
    }

      if (!response.ok) {
        setMessage(
          data.detail || "Invalid username or password."
        );
        return;
      }

      // Clear old session data
      [
        "access_token",
        "refresh_token",
        "user",
      ].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Save credentials according to Remember Me
      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem("access_token", data.access);
      storage.setItem("refresh_token", data.refresh);

      if (data.user) {
        storage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect according to the user's role
      const role = data.user?.role;

      if (role === "Manager" || role === "Admin") {
        navigate("/manager", { replace: true });
      } else if (role === "Nurse") {
        navigate("/dashboard", { replace: true });
      } else if (role === "Non-medical Staff") {
        navigate("/staff", { replace: true });
      } else {
        setMessage(
          "Your account role is not recognized. Please contact the administrator."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* LEFT BRANDING PANEL */}
      <section className="login-brand">
        <Link to="/" className="brand-logo">
          <span className="brand-logo-icon">+</span>
          <span>HandoverMind</span>
        </Link>

        <div className="brand-illustration">
          <div className="illustration-circle">
            <span role="img" aria-label="Stethoscope">
              🩺
            </span>
          </div>

          <p>AI-Powered Nurse Handoff Assistant</p>
        </div>

        <div className="brand-bottom">
          <h2>
            Smarter Handoffs.
            <br />
            Safer Workflows.
          </h2>

          <p>
            Transform voice and text handoffs into structured,
            reviewable patient summaries.
          </p>
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to continue to HandoverMind</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label htmlFor="username">Email Address</label>

              <input
                id="username"
                type="text"
                placeholder="Enter your email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="login-link"
                onClick={(e) => {
                  e.preventDefault();
                  setMessage(
                    "Please contact your administrator to reset your password."
                  );
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {message && (
              <p className="login-error" role="alert">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="login-security">
            <span aria-hidden="true">🔒</span>
            <span>
              Secure access for authorized healthcare staff
            </span>
          </div>

          <p className="create-account">
            Don't have an account?{" "}
            <Link to="/signup" className="login-link">
              Create Account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;