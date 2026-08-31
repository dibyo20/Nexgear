import React from "react";
import { Link } from "react-router-dom";

export const AuthBrand = ({ className = "" }) => {
  return (
    <Link to="/" className={`auth-brand ${className}`} aria-label="Nexgear Home">
      <svg
        className="auth-brand__logo"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="#0066FF" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="#ffffff" fillOpacity="0.85" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="#ffffff" fillOpacity="0.85" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="#0066FF" />
      </svg>
      <span className="auth-brand__text">Nexgear</span>
    </Link>
  );
};

export default AuthBrand;
