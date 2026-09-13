import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hook/useAuth.js";

/**
 * ProtectedRoute component:
 * - Shows loading state while checking user authentication
 * - Redirects unauthenticated users to /login
 * - Optionally checks allowedRoles for role-based protection
 * - Renders children when authorized
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
