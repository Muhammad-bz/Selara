import React, { memo, useCallback, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

/* Instagram SVG icon */
function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill={color} stroke="none" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT FORM — connected to Firestore "messages"
═══════════════════════════════════════════════ */
function ContactForm() {
  const [form,    setForm]    = useState({ name: "", email: "", message: "" });
  const [status,  setStatus]  = useState("idle"); // idle | sending | success | error
  const [errMsg,  setErrMsg]  = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrMsg("Please fill in all fields.");
      return;
    }
    setStatus("sending");
    setErrMsg("");
    try {
      await addDoc(collection(db, "messages"), {
        name:      form.name.trim(),
        email:     form.email.trim(),
        message:   form.message.trim(),
        createdAt: serverTimestamp(),
        status:    "unread",
      });
      setForm({ name: "", email: "", message: "" });
      setStatus("success");
    } catch (err) {
      console.error("Message save error:", err);
      setStatus("error");
      setErrMsg("Something went wrong. Please try again.");
    }
  }, [form]);

  const inputStyle = {
    width: "100%", padding: "10px 12px", boxSizing: "border-box",
    fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
    color: C.cream, background: "rgba(250,246,239,0.06)",
    border: "1px solid rgba(242,196,206,0.15)", outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div>
      <p style={{ fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.blush, marginBottom: 16 }}>
        Get in Touch
      </p>

      {status === "success" ? (
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.blush, lineHeight: 1.7 }}>
          ✓ Thank you! We'll get back to you soon.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            style={inputStyle}
            placeholder="Your name"
            value={form.name}
            onChange={set("name")}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.45)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.15)"; }}
          />
          <input
            style={inputStyle}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={set("email")}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.45)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.15)"; }}
          />
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            placeholder="Your message…"
            value={form.message}
            onChange={set("message")}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.45)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(242,196,206,0.15)"; }}
          />
          {errMsg && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#f87171", margin: 0 }}>{errMsg}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={status === "sending"}
            style={{
              background: "none", border: `1px solid ${C.blush}`,
              color: C.blush, padding: "10px 20px",
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: status === "sending" ? "not-allowed" : "pointer",
              opacity: status === "sending" ? 0.6 : 1,
              transition: "background 0.2s, color 0.2s",
              alignSelf: "flex-start",
            }}
            onMouseEnter={(e) => { if (status !== "sending") { e.currentTarget.style.background = C.blush; e.currentTarget.style.color = C.charcoal; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.blush; }}
          >
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
const Footer = memo(function Footer({ settings = {} }) {
  const scrollTo = useCallback((id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
  []);

  const instagramHandle = settings.instagramHandle || settings.instagram || null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle.replace(/^@/, "")}`
    : null;

  return (
    <footer style={{
      background: C.charcoal,
      borderTop: "1px solid rgba(242,196,206,0.08)",
      padding: "56px 5% 28px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.storeName || "Your Store"} style={{ height: 40, maxWidth: 160, objectFit: "contain", marginBottom: 10, display: "block" }} />
            ) : (
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 300, color: C.cream, letterSpacing: "0.06em", marginBottom: 4 }}>
                {settings.storeName || "Your Store"}
              </p>
            )}
            <p style={{ fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: C.blush, marginBottom: 14 }}>
              {settings.tagline || "Feminine · Modern · Pret"}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300, color: "rgba(250,246,239,0.4)", lineHeight: 1.7, maxWidth: 280 }}>
              {settings.aboutText
                ? settings.aboutText.substring(0, 120) + (settings.aboutText.length > 120 ? "…" : "")
                : "Curated with care for every customer. No compromises on quality. Just great products and honest service."}
            </p>

            {/* Instagram link */}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  marginTop: 18, textDecoration: "none",
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                  color: "rgba(242,196,206,0.55)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.blush; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(242,196,206,0.55)"; }}
              >
                <InstagramIcon size={15} color="currentColor" />
                @{instagramHandle.replace(/^@/, "")}
              </a>
            )}

            {/* Phone / WhatsApp */}
            {settings.phone && (
              <a
                href={`https://wa.me/${settings.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: 10, textDecoration: "none",
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                  color: "rgba(242,196,206,0.55)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.blush; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(242,196,206,0.55)"; }}
              >
                {settings.phone}
              </a>
            )}
          </div>

          {/* Explore */}
          <div>
            <p style={{ fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.blush, marginBottom: 16 }}>
              Explore
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
             {[["featured","Featured"],["menu","Collections"],["about","About Us"],["contact","Contact"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    textAlign: "left",
                    fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                    color: "rgba(250,246,239,0.45)", transition: "color 0.2s",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.blush; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(253,248,245,0.40)"; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

</div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(242,196,206,0.08)",
          paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
        }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(253,248,245,0.20)" }}>
            &copy; {new Date().getFullYear()} {settings.storeName || "Selara"}. All rights reserved.
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(242,196,206,0.25)", letterSpacing: "0.06em" }}>
            Feminine · Modern · Pret
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
