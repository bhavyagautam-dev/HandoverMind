
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Invalid username or password");
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("access_token", data.access);
      storage.setItem("refresh_token", data.refresh);

      if (data.user) {
        storage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left blue panel */}
      <section className="login-brand">

        <div className="brand-logo">
          <span className="brand-logo-icon">✚</span>
          <span>HandoverMind</span>
        </div>

        {/* Icon and text are stacked vertically */}
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

      {/* Right login panel */}
      <section className="login-form-panel">
        <div className="login-form-wrapper">

          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to continue to HandoverMind</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">

            <div className="form-field">
              <label htmlFor="username">UserName</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
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
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a href="/forgot-password" className="login-link">
                Forgot Password?
              </a>
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
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="login-security">
            <span>🔒</span>
            <span>Secure access for authorized healthcare staff</span>
          </div>

          <p className="create-account">
            Don&apos;t have an account?{" "}
            <a href="/register" className="login-link">
              Create Account
            </a>
          </p>

        </div>
      </section>
    </div>
  );
}

export default Login;
