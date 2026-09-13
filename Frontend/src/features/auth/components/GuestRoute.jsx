import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";

/**
 * GuestRoute component:
 * Prevents authenticated users from accessing guest-only routes like /login and /register.
 * Redirects sellers to /seller/dashboard and buyers to /.
 */
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0b0c0e",
          color: "#f3f4f6",
        }}
      >
        <svg
          className="spinner"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  if (user) {
    if (user.role === "seller") {
      return <Navigate to="/seller/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
