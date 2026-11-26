
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

  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const getErrorMessage = (data) => {
    if (data?.detail) return data.detail;

    return Object.entries(data || {})
      .map(([field, value]) => {
        const detail = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${field}: ${detail}`;
      })
      .join(" | ") || "Something went wrong. Please try again.";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");

    if (name === "email") {
      setEmailVerified(false);
      setVerificationToken("");
      setOtpSent(false);
      setOtp("");
    }
  };

  const sendOtp = async (isResend = false) => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setOtpLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = isResend
        ? `${API_URL}/auth/resend-otp/`
        : `${API_URL}/auth/send-otp/`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: formData.fullName.trim().split(/\s+/)[0] || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setOtpSent(true);
      setEmailVerified(false);
      setVerificationToken("");
      setOtp("");

      setMessage(
        isResend
          ? "A new OTP has been sent. Please check your inbox."
          : "OTP sent successfully. Please check your email inbox."
      );
    } catch (err) {
      setError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    setVerifyLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (!data.verification_token) {
        throw new Error("Verification token was not returned by the server.");
      }

      setVerificationToken(data.verification_token);
      setEmailVerified(true);
      setOtpSent(false);
      setOtp("");

      setMessage(
        "Email verified successfully. You can now register your hospital."
      );
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
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

    if (!emailVerified || !verificationToken) {
      setError("Please verify your email before registering.");
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
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      verification_token: verificationToken,
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
        throw new Error(getErrorMessage(data));
      }

      setMessage(
        "Hospital registered successfully. Redirecting to login..."
      );

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
          email: formData.email.trim().toLowerCase(),
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

            <div className="signup-email-row">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="manager@hospital.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={emailVerified}
                required
              />

              {emailVerified ? (
                <span className="signup-verified-badge">
                  <span aria-hidden="true">✓</span> Verified
                </span>
              ) : (
                <button
                  type="button"
                  className="signup-verify-button"
                  onClick={() => sendOtp(false)}
                  disabled={otpLoading || !formData.email.trim()}
                >
                  {otpLoading
                    ? "Sending..."
                    : otpSent
                      ? "OTP Sent"
                      : "Verify Now"}
                </button>
              )}
            </div>

            <small className="signup-field-hint">
              Verify your email address before registering the hospital.
            </small>
          </div>

          {otpSent && !emailVerified && (
            <div className="signup-otp-panel">

              <div className="signup-otp-heading">
                <strong>Verify your email</strong>
                <span>
                  Enter the 6-digit code sent to your inbox.
                </span>
              </div>

              <div className="signup-otp-row">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="6-digit email OTP"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => {
                    setOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6)
                    );
                    setError("");
                  }}
                  maxLength={6}
                />

                <button
                  type="button"
                  className="signup-verify-button"
                  onClick={handleVerifyOtp}
                  disabled={verifyLoading || otp.length !== 6}
                >
                  {verifyLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <button
                type="button"
                className="signup-resend-button"
                onClick={() => sendOtp(true)}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending..." : "Resend OTP"}
              </button>

            </div>
          )}

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

          {!emailVerified && (
            <p className="signup-verification-note">
              <span aria-hidden="true">🔒</span>
              Email verification is required to enable hospital registration.
            </p>
          )}

          <button
            type="submit"
            className="signup-submit"
            disabled={loading || !emailVerified || !verificationToken}
          >
            {loading ? "Registering..." : "Register Hospital"}
          </button>

        </form>

        <div className="signup-footer">
          <p>
            Already registered?{" "}
            <Link to="/login" className="signup-login-link">
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
