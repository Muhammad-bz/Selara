// src/components/admin/AdminLogin.jsx
import React, { useState } from "react";
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

export default function AdminLogin() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, #FDF8F5 0%, #F7EEE9 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_BODY,
      padding: "24px",
    }}>
      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        border: `1px solid rgba(201,129,143,0.15)`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(201,129,143,0.10), 0 4px 16px rgba(201,129,143,0.06)",
      }}>

        {/* Top accent strip */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, #1C1C1C, #C9818F, #F2C4CE)`,
        }} />

        <div style={{ padding: "44px 40px 40px" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56,
              background: "#1C1C1C",
              borderRadius: 14,
              margin: "0 auto 18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 16px rgba(28,12,18,0.22)`,
            }}>
              {/* Store bag icon */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F2C4CE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h1 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 30,
              fontWeight: 400,
              fontStyle: "italic",
              color: C.espresso,
              margin: "0 0 6px",
              letterSpacing: "0.02em",
            }}>
              Admin Portal
            </h1>
            <p style={{ color: C.mist, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              Sign in to manage your store
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderLeft: "3px solid #DC2626",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#DC2626",
              fontSize: 13,
              marginBottom: 22,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                placeholder="admin@yourstore.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "14px",
                background: busy ? "#9A8A8A" : "#1C1C1C",
                color: "#FDF8F5",
                border: "none",
                borderRadius: 8,
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: busy ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {busy ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25"/>
                    <path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            margin: "28px 0 0",
            borderTop: `1px solid ${C.line}`,
            paddingTop: 20,
            textAlign: "center",
          }}>
            <a href="/" style={{
              color: "#C9818F",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              opacity: 0.85,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to storefront
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "#9A8A8A",
  marginBottom: 7,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid rgba(201,129,143,0.20)",
  borderRadius: 8,
  fontFamily: "'Jost', system-ui, sans-serif",
  fontSize: 14,
  color: "#1C1C1C",
  background: "#FDF8F5",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s, box-shadow 0.18s",
};

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Sign-in failed. Please try again.";
  }
}
