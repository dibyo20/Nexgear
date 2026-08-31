import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";
import AuthBrand from "../components/AuthBrand.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import "../styles/Login.scss";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading, error, clearAuthError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (localError) setLocalError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    const result = await handleLogin(formData);
    if (result?.success) {
      navigate("/");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const displayError = localError || error;

  return (
    <div className="auth-layout">
      {/* Left Form Pane */}
      <section className="auth-layout__form-pane">
        <div className="auth-layout__form-container">
          <AuthBrand />

          <header className="auth-header">
            <h1 className="auth-header__title">Welcome back</h1>
            <p className="auth-header__subtitle">
              Sign in to access your professional-grade instruments.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {displayError && (
              <div className="auth-form__error-banner" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            {/* Email Address */}
            <div className="auth-form__field">
              <div className="auth-form__field-header">
                <label htmlFor="login-email" className="auth-form__label">
                  Email Address
                </label>
              </div>
              <div className="auth-form__input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="auth-form__input"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-form__field">
              <div className="auth-form__field-header">
                <label htmlFor="login-password" className="auth-form__label">
                  Password
                </label>
              </div>
              <div className="auth-form__input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="auth-form__input auth-form__input--has-icon"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-form__eye-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-form__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="spinner"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google SSO */}
          <GoogleButton text="Continue with Google" />

          {/* Switch to Register */}
          <div className="auth-footer-prompt">
            <span>Don't have an account?</span>
            <Link to="/register" className="auth-footer-prompt__link">
              Create one
            </Link>
          </div>
        </div>
      </section>

      {/* Right Hero Image Pane (Desktop) */}
      <section className="auth-layout__hero-pane" aria-hidden="true">
        <img
          src="/assets/login-keyboard.jpg"
          alt="Nexgear Premium Keyboard"
          className="auth-layout__hero-img"
        />
        <div className="auth-layout__hero-overlay" />

        {/* Writings placed in the middle as requested */}
        <div className="auth-layout__hero-content-middle">
          <span className="auth-hero-badge">Nexgear Pro Series</span>
          <h2 className="auth-hero-title">Precision in every keystroke.</h2>
          <p className="auth-hero-desc">
            Experience the ultimate fusion of technical excellence and minimalist design.
            Built for professionals who demand uncompromising performance.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
