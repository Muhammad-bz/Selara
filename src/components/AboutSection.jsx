import React, { memo } from "react";
import { C, FONT_DISPLAY, FONT_BODY, IMG } from "../constants/theme";

/* ═══════════════════════════════════════════════
   ABOUT SECTION
═══════════════════════════════════════════════ */
const AboutSection = memo(function AboutSection({ settings = {} }) {
  return (
    <section id="about" className="section-pad" style={{ background: C.charcoal }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="about-grid">
          <div className="about-image-col reveal" style={{ position: "relative" }}>
            <img
              src={settings.aboutImageUrl || IMG.about}
              alt="About our store"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%", height: "clamp(280px, 40vw, 460px)",
                objectFit: "cover", borderRadius: 4, display: "block",
              }}
            />
            <div className="hide-mobile" style={{
              position: "absolute", bottom: -24, right: -20,
              width: 160, height: 160,
              borderRadius: 4, overflow: "hidden",
              border: `3px solid ${C.charcoal}`,
            }}>
              <img
                src={IMG.aboutSmall}
                alt="Store products"
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div aria-hidden="true" style={{
              position: "absolute", top: -10, left: -10,
              width: "38%", height: "38%",
              border: `1px solid ${C.blush}`,
              borderRadius: 4, opacity: 0.35, pointerEvents: "none",
            }} />
          </div>

          <div className="reveal">
            <p style={{
              fontFamily: FONT_BODY, fontSize: 9,
              letterSpacing: "0.36em", textTransform: "uppercase",
              color: C.blush, marginBottom: 12,
            }}>
              Our Story
            </p>
            <div className="divider left" style={{ background: C.blush }} />
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 300,
              fontSize: "clamp(26px, 4vw, 44px)",
              color: C.cream, lineHeight: 1.15,
              margin: "16px 0 18px",
            }}>
              Fashion born from
              <br />
              <em style={{ fontStyle: "italic" }}>a love of craft</em>
            </h2>
            {settings.aboutText ? (
              <p style={{
                fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                color: "rgba(250,246,239,0.7)", lineHeight: 1.85, marginBottom: 32,
                whiteSpace: "pre-line",
              }}>
                {settings.aboutText}
              </p>
            ) : (
              <>
                <p style={{
                  fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                  color: "rgba(253,248,245,0.65)", lineHeight: 1.9, marginBottom: 18,
                }}>
                  Selara was born from a simple belief: that every woman deserves clothing that makes her feel
                  effortlessly beautiful. We craft feminine, modern pret — designed with intention and
                  made with care.
                </p>
                <p style={{
                  fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                  color: "rgba(253,248,245,0.65)", lineHeight: 1.9, marginBottom: 32,
                }}>
                  Each piece in our collection is thoughtfully curated — no compromise on fabric, fit, or
                  finish. Just honest craftsmanship and a commitment to making you look and feel your best.
                </p>
              </>
            )}
            <div className="stats-row">
              {[["Pret", "Collection"], ["Lahore", "Pakistan"]].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 300, color: C.blush, lineHeight: 1 }}>
                    {n}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 9, color: "rgba(253,248,245,0.40)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;
