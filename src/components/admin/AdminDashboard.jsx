// src/components/admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const C = {
  cream:     "#FDF8F5",
  creamDeep: "#F7EEE9",
  chocolate: "#C9818F",
  espresso:  "#1C1C1C",
  gold:      "#C9818F",
  caramel:   "#E8A0B0",
  mist:      "#9A8A8A",
  line:      "rgba(201,129,143,0.15)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'Jost', system-ui, sans-serif";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7EEE9", fontFamily: FONT_BODY }}>
      {/* Top bar */}
      <header style={{
        background: "#1C1C1C",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: "#F2C4CE", fontWeight: 400 }}>
          Cremeo Admin
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(250,246,239,0.65)" }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 16px",
              background: "transparent",
              border: `1px solid rgba(201,129,143,0.5)`,
              borderRadius: 3,
              color: "#F2C4CE",
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#C9818F"; e.target.style.color = "#F2C4CE"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "rgba(201,129,143,0.5)"; }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: "48px 32px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400, fontStyle: "italic", color: C.espresso, marginBottom: 6, letterSpacing: "0.02em" }}>
          Dashboard
        </h1>
        <div style={{ width: 40, height: 1, background: "#C9818F", marginBottom: 32, opacity: 0.6 }} />

        <div style={{
          background: "#fff",
          border: `1px solid rgba(201,129,143,0.15)`,
          borderRadius: 6,
          padding: 32,
          boxShadow: "0 2px 12px rgba(201,129,143,0.06)",
        }}>
          <p style={{ color: C.mist, fontSize: 15, lineHeight: 1.6 }}>
            Welcome back! You're signed in as <strong style={{ color: "#C9818F" }}>{user?.email}</strong>.
          </p>
          <p style={{ color: C.mist, fontSize: 14, marginTop: 12 }}>
            Build your admin features here — this route is fully protected by Firebase Authentication.
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: C.caramel,
              textDecoration: "none",
            }}
          >
            ← View public website
          </a>
        </div>
      </main>
    </div>
  );
}
