// src/components/admin/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wrap any element with <ProtectedRoute> to require authentication.
 * While the auth state is loading we render nothing (avoids flash).
 * Once resolved:
 *   - authenticated → render children
 *   - unauthenticated → redirect to /admin/login, preserving the
 *     intended destination so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FDF8F5",
        fontFamily: "'Jost', system-ui, sans-serif",
        color: "#9A8A8A",
        fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
