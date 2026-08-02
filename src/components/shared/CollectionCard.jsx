// src/components/shared/CollectionCard.jsx
import React, { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_BODY } from "../../constants/theme";

/* ═══════════════════════════════════════════════
   COLLECTION CARD
   Props:
     collection  — { id, name, tagline, imageUrl, slug? }
     href        — optional override URL (defaults to /collection/:id or :slug)
     onClick     — optional click handler override
═══════════════════════════════════════════════ */
const CollectionCard = memo(function CollectionCard({ collection, href, onClick }) {
  const navigate  = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { id, name, tagline, imageUrl, slug } = collection ?? {};

  const destination = href ?? `/collection/${slug ?? id}`;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(collection);
      return;
    }
    navigate(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onClick, collection, navigate, destination]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Browse ${name} collection`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-lift reveal selara-collection-card"
      style={{
        background:   C.cream,
        border:       `1px solid ${C.line}`,
        overflow:     "hidden",
        display:      "flex",
        flexDirection: "column",
        cursor:       "pointer",
        outline:      "none",
        contain:      "layout style",
        /* Keyboard focus ring — visible only on keyboard nav */
        ...(hovered ? {} : {}),
      }}
      /* Accessible focus ring via CSS class defined in GlobalStyles */
      onFocus={(e)  => { e.currentTarget.style.boxShadow = `0 0 0 2px ${C.rose}`; }}
      onBlur={(e)   => { e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* ── Cloudinary / remote image ── */}
      <div
        style={{
          position:    "relative",
          paddingBottom: "100%",   /* 1:1 square — adjust to "125%" for portrait */
          overflow:    "hidden",
          flexShrink:  0,
        }}
      >
        {imgErr || !imageUrl ? (
          /* Graceful placeholder matching img-placeholder convention */
          <div
            className="img-placeholder"
            style={{ position: "absolute", inset: 0 }}
          />
        ) : (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
            style={{
              position:   "absolute",
              inset:      0,
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              transform:  hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        )}

        {/* Subtle gradient overlay so text never fights the image */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to top, rgba(28,28,28,0.18) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Text block ── */}
      <div
        style={{
          padding:       "16px 16px 18px",
          flex:          1,
          display:       "flex",
          flexDirection: "column",
          gap:           4,
        }}
      >
        {/* Collection name */}
        <h3
          style={{
            fontFamily:  FONT_DISPLAY,
            fontWeight:  400,
            fontSize:    20,
            color:       hovered ? C.rose : C.charcoal,
            lineHeight:  1.2,
            margin:      0,
            transition:  "color 0.2s ease",
          }}
        >
          {name}
        </h3>

        {/* Small tagline */}
        {tagline && (
          <p
            style={{
              fontFamily:    FONT_BODY,
              fontWeight:    300,
              fontSize:      12,
              color:         C.mist,
              lineHeight:    1.6,
              letterSpacing: "0.03em",
              margin:        0,
            }}
          >
            {tagline}
          </p>
        )}

        {/* Animated underline CTA — matching the site's "Shop now" convention */}
        <span
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           6,
            marginTop:     10,
            fontFamily:    FONT_BODY,
            fontSize:      10,
            fontWeight:    500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color:         hovered ? C.rose : C.slate,
            transition:    "color 0.2s ease",
          }}
        >
          Shop collection
          {/* Small arrow that nudges right on hover */}
          <svg
            width="14" height="10" viewBox="0 0 14 10" fill="none"
            style={{
              transform:  hovered ? "translateX(3px)" : "translateX(0)",
              transition: "transform 0.25s ease",
            }}
          >
            <path
              d="M1 5h12M8 1l4 4-4 4"
              stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
});

export default CollectionCard;
