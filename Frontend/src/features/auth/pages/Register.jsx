import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";
import GoogleButton from "../components/GoogleButton.jsx";
import "../styles/Register.scss";

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister, loading, error, clearAuthError } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    isSeller: false,
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (localError) setLocalError("");

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname.trim()) {
      setLocalError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setLocalError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    const payload = {
      fullname: formData.fullname,
      email: formData.email,
      contact: formData.contact || "0000000000",
      password: formData.password,
      isSeller: formData.isSeller,
    };

    const result = await handleRegister(payload);
    if (result?.success) {
      navigate("/");
    }
  };

  const displayError = localError || error;

  return (
    <div className="register-layout">
      {/* Left Form Pane */}
      <section className="register-layout__form-pane">
        <div className="register-layout__form-container">
          <Link to="/" className="auth-brand" aria-label="Nexgear Home">
            <img src="/nexgear-logo.svg" alt="Nexgear" className="auth-brand__logo" />
            <span className="auth-brand__text">Nexgear</span>
          </Link>

          <header className="auth-header">
            <h1 className="auth-header__title">Create your Nexgear account</h1>
            <p className="auth-header__subtitle">
              Join the ecosystem of professional grade instruments.
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

            {/* Full Name */}
            <div className="auth-form__field">
              <label htmlFor="reg-fullname" className="auth-form__label">
                Full Name
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="reg-fullname"
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="auth-form__input"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="auth-form__field">
              <label htmlFor="reg-email" className="auth-form__label">
                Email Address
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="auth-form__input"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-form__field">
              <label htmlFor="reg-password" className="auth-form__label">
                Password
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="auth-form__input auth-form__input--has-icon"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-form__eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
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

            {/* Confirm Password */}
            <div className="auth-form__field">
              <label htmlFor="reg-confirm-password" className="auth-form__label">
                Confirm Password
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="auth-form__input auth-form__input--has-icon"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-form__eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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

            {/* Checkbox Group */}
            <div className="auth-form__checkbox-group">
              <label className="auth-form__checkbox-label">
                <input
                  type="checkbox"
                  className="auth-form__checkbox-input"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to the <Link to="/register">Terms & Conditions</Link> and{" "}
                  <Link to="/register">Privacy Policy</Link>.
                </span>
              </label>

              <label className="auth-form__checkbox-label">
                <input
                  type="checkbox"
                  name="isSeller"
                  className="auth-form__checkbox-input"
                  checked={formData.isSeller}
                  onChange={handleChange}
                />
                <span>Register as Seller</span>
              </label>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google SSO */}
          <GoogleButton text="Continue with Google" />

          {/* Switch to Login */}
          <div className="auth-footer-prompt">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-footer-prompt__link">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Right Hero Image Pane */}
      <section className="register-layout__hero-pane" aria-hidden="true">
        <img
          src="/assets/register-keyboard.jpg"
          alt="Nexgear Premium Keyboard Artisan Setup"
          className="register-layout__hero-img"
        />
        <div className="register-layout__hero-overlay" />

        {/* Floating Glassmorphism Card at bottom */}
        <div className="register-layout__hero-card">
          <h2 className="auth-hero-card-title">Professional Grade Instruments.</h2>
          <p className="auth-hero-card-desc">
            Engineered for precision, crafted for those who demand excellence in every keystroke.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;