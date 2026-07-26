import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ShoppingBag, X, Menu, Instagram, Facebook } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

/* ═══════════════════════════════════════════════
   NAVBAR — SELARA PREMIUM FASHION
   PERF: transition specifies only 'background-color, padding, border-color'
         instead of 'all' — prevents layout recalculation on every tick.
         backdropFilter only applied when scrolled.
═══════════════════════════════════════════════ */

const SELARA_NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');

  @keyframes selara-mobile-in {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes selara-item-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Desktop nav links — tracked uppercase with rose underline on hover */
  .selara-nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    font-size: 9.5px;
    font-weight: 400;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 6px 0;
    position: relative;
    transition: color 0.25s ease;
  }
  .selara-nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0.5px;
    background: #F2C4CE;
    transition: width 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .selara-nav-link:hover::after {
    width: 100%;
  }
  .selara-nav-link:hover {
    color: rgba(253,248,245,1) !important;
  }

  /* Mobile menu link rows */
  .selara-mobile-link {
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 300;
    font-size: clamp(38px, 8vw, 58px);
    color: rgba(250,246,239,0.90);
    letter-spacing: 0.06em;
    padding: 18px 0;
    border-bottom: 0.5px solid rgba(250,246,239,0.08);
    transition: color 0.25s ease, letter-spacing 0.25s ease;
  }
  .selara-mobile-link:hover {
    color: #F2C4CE;
    letter-spacing: 0.10em;
  }
`;

export default function Navbar({ cartCount, onCartOpen, cartBouncing, settings = {}, forceScrolled = false }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isScrolled = forceScrolled || scrolled;

  /* Inject CSS once */
  useEffect(() => {
    if (!document.getElementById("selara-nav-css")) {
      const style = document.createElement("style");
      style.id = "selara-nav-css";
      style.textContent = SELARA_NAV_CSS;
      document.head.appendChild(style);
    }
  }, []);

  /* RAF-throttled scroll listener */
  useEffect(() => {
    let rafId = null;
    let last  = false;
    const check = () => {
      const s = window.scrollY > 80;
      if (s !== last) { last = s; setScrolled(s); }
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const navLinks = useMemo(() => [
    { label: "Featured", id: "featured" },
    { label: "Collection",     id: "Collection"     },
    { label: "About",    id: "about"    },
    { label: "Contact",  id: "contact"  },
  ], []);

  /* Always ivory text — scrolled bg is dark so contrast holds in both states */
  const textColor    = "rgba(250,246,239,0.92)";
  const textColorDim = "rgba(250,246,239,0.50)";

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: isScrolled ? "14px 6%" : "22px 6%",
          background: isScrolled ? "rgba(10,8,6,0.96)" : "transparent",
          backdropFilter: isScrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(14px)" : "none",
          borderBottom: isScrolled ? "0.5px solid rgba(250,246,239,0.08)" : "none",
          transition: "background-color 0.40s ease, padding 0.40s ease, border-color 0.40s ease",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          willChange: "background-color",
        }}
      >

        {/* ── Logo ── */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "baseline",
            flexShrink: 0, padding: 0,
          }}
          aria-label="Back to top"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName || "Selara"}
              style={{ height: 32, maxWidth: 140, objectFit: "contain", display: "block" }}
            />
          ) : (
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 22,
              fontWeight: 300,
              color: textColor,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
              transition: "color 0.3s ease",
            }}>
              {settings.storeName || "Selara"}
            </span>
          )}
        </button>

        {/* ── Desktop nav links ── */}
        <div className="hide-mobile" style={{ display: "flex", gap: 44, alignItems: "center" }}>
          {navLinks.map((l) => (
            <button
              key={l.id}
              className="selara-nav-link"
              onClick={() => scrollTo(l.id)}
              style={{ color: textColor }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* ── Right controls ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            className={cartBouncing ? "cart-bounce" : ""}
            aria-label={`Cart (${cartCount} items)`}
            style={{
              position: "relative", background: "none", border: "none",
              cursor: "pointer",
              color: textColor,
              padding: "6px 8px",
              transition: "color 0.25s ease",
            }}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                minWidth: 15, height: 15,
                background: "#F2C4CE",
                color: "#1C1C1C",
                fontSize: 8,
                fontFamily: "'Jost', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px",
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hide-desktop"
            onClick={() => setMobileOpen(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: textColor,
              padding: "6px 4px",
              transition: "color 0.25s ease",
            }}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          Mobile menu — full-screen dark overlay
          slides in from right
      ══════════════════════════════════════════ */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1100,
          background: "#0A0806",
          display: "flex", flexDirection: "column",
          padding: "0 7%",
          animation: "selara-mobile-in 0.30s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        }}>

          {/* Mobile header row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "22px 0",
            borderBottom: "0.5px solid rgba(250,246,239,0.08)",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 20,
              fontWeight: 300,
              color: textColor,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              {settings.storeName || "Selara"}
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: textColorDim,
                padding: 4,
                transition: "color 0.2s ease",
              }}
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", paddingTop: 12, flex: 1 }}>
            {navLinks.map((l, i) => (
              <button
                key={l.id}
                className="selara-mobile-link"
                onClick={() => scrollTo(l.id)}
                style={{
                  animation: `selara-item-up 0.38s ease ${0.06 + i * 0.06}s both`,
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Social + season label */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            padding: "28px 0",
            borderTop: "0.5px solid rgba(250,246,239,0.08)",
          }}>
            <div style={{ display: "flex", gap: 20 }}>
              {(settings.instagram || "#") && (
                <a
                  href={settings.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{ color: textColorDim, transition: "color 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = textColorDim}
                >
                  <Instagram size={17} strokeWidth={1.5} />
                </a>
              )}
              {(settings.facebook || "#") && (
                <a
                  href={settings.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{ color: textColorDim, transition: "color 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = textColorDim}
                >
                  <Facebook size={17} strokeWidth={1.5} />
                </a>
              )}
            </div>
            <span style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 8,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "rgba(242,196,206,0.30)",
            }}>
              Feminine · Modern · Pret
            </span>
          </div>
        </div>
      )}
    </>
  );
}
