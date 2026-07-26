// src/components/shared/ProductCard.jsx
import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check, Plus } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../../constants/theme";

/* Resolve all images for a product (supports images[], mainImage, imageUrl, img)yes */
function resolveImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  const single = product.mainImage || product.imageUrl || product.img;
  return single ? [single] : [];
}

/* ═══════════════════════════════════════════════
   PRODUCT CARD
   Clicking the image / name navigates to /product/:id.
   The Add button still adds directly to cart (no nav).
   Multiple images auto-advance with fade transition.
═══════════════════════════════════════════════ */
const ProductCard = memo(function ProductCard({ product, onAdd, wishlist, toggleWish }) {
  const navigate = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [imgErr,  setImgErr]  = useState(false);
  const wished = wishlist?.has(product.id);

  // Multi-image carousel state
  const images   = resolveImages(product);
  const hasMany  = images.length > 1;
  const [active,  setActive]  = useState(0);
  const [fading,  setFading]  = useState(false);
  const autoRef  = useRef(null);

  const goTo = useCallback((idx) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 260);
  }, [active]);

  const next = useCallback(() => {
    goTo((active + 1) % images.length);
  }, [active, images.length, goTo]);

  // Auto-advance every 3.5s when there are multiple images
  useEffect(() => {
    if (!hasMany) return;
    autoRef.current = setInterval(next, 3500);
    return () => clearInterval(autoRef.current);
  }, [next, hasMany]);

  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    onAdd({ ...product, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [onAdd, product]);

  const handleToggleWish = useCallback((e) => {
    e.stopPropagation();
    toggleWish?.(product.id);
  }, [toggleWish, product.id]);

  const goToProduct = useCallback(() => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, product.id]);

  const currentSrc = images[active] || "";

  return (
    <div
      className="card-lift reveal selara-product-card"
      style={{
        background: C.cream,
        border: `1px solid ${C.line}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        contain: "layout style",
      }}
    >
      {/* ── Image / Carousel — clickable ── */}
      <div
        onClick={goToProduct}
        style={{ position: "relative", paddingBottom: "125%", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
      >
        {imgErr || !currentSrc ? (
          <div className="img-placeholder" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        ) : (
          <img
            key={active}
            src={currentSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: fading ? 0 : 1,
              transition: "opacity 0.26s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
              willChange: "opacity, transform",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        )}
        {product.tag && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: C.rose, color: "#fff",
            fontFamily: FONT_BODY, fontSize: 8, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "5px 10px",
          }}>
            {product.tag}
          </span>
        )}
        {toggleWish && (
          <button
            onClick={handleToggleWish}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(253,248,245,0.90)", border: "none",
              borderRadius: "50%", width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,196,206,0.95)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.90)"; }}
          >
            <Heart size={14} fill={wished ? C.rose : "none"} color={wished ? C.rose : C.mist} />
          </button>
        )}

        {/* Dot indicators for multi-image */}
        {hasMany && (
          <div style={{
            position: "absolute", bottom: 8, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 4, zIndex: 2,
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); clearInterval(autoRef.current); goTo(i); }}
                aria-label={`Image ${i + 1}`}
                style={{
                  width: i === active ? 16 : 5, height: 5,
                  background: i === active ? C.rose : "rgba(253,248,245,0.55)",
                  border: "none", padding: 0, cursor: "pointer",
                  transition: "width 0.28s ease, background 0.28s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Quick-add overlay on hover */}
        <div
          onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: added ? C.rose : "rgba(28,28,28,0.82)",
            color: "#fff",
            fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "13px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: 0,
            transform: "translateY(4px)",
            transition: "opacity 0.3s ease, transform 0.3s ease, background 0.2s",
            cursor: "pointer",
          }}
          className="card-quick-add"
        >
          {added ? <><Check size={11} /> Added to bag</> : <><Plus size={11} /> Add to bag</>}
        </div>
      </div>

      {/* ── Info ── */}
      <div style={{ padding: "14px 4px 4px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          onClick={goToProduct}
          style={{
            fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 17,
            color: C.charcoal, marginBottom: 4, lineHeight: 1.25,
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.rose; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.charcoal; }}
        >
          {product.name}
        </h3>

        {product.desc && (
          <p style={{
            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 300,
            color: C.mist, lineHeight: 1.6, flex: 1, marginBottom: 10,
          }}>
            {product.desc}
          </p>
        )}

        {/* Add-ons */}
        {Array.isArray(product.addons) && product.addons.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {product.addons.map((addon, i) => (
              addon.name ? (
                <p key={i} style={{
                  fontFamily: FONT_BODY, fontSize: 11, fontWeight: 400,
                  color: C.mist, lineHeight: 1.5,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ color: C.rose, fontWeight: 500 }}>+</span>
                  {addon.name}
                  {addon.price ? (
                    <span style={{ color: C.slate }}>
                      — PKR {Number(addon.price).toLocaleString()}
                    </span>
                  ) : null}
                </p>
              ) : null
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 400, color: C.slate, flexShrink: 0 }}>
            {fmt(product.price)}
          </span>
          {/* Minimal add button — desktop fallback when overlay not visible */}
          <button
            onClick={handleAdd}
            style={{
              background: "none",
              color: added ? C.rose : C.mist,
              border: `1px solid ${added ? C.rose : C.line}`,
              padding: "7px 12px", fontSize: 9, fontWeight: 500,
              letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: "pointer", transition: "color 0.2s, border-color 0.2s",
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!added) { e.currentTarget.style.color = C.rose; e.currentTarget.style.borderColor = C.rose; } }}
            onMouseLeave={(e) => { if (!added) { e.currentTarget.style.color = C.mist; e.currentTarget.style.borderColor = C.line; } }}
          >
            {added ? <><Check size={10} /> Added</> : <><Plus size={10} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
