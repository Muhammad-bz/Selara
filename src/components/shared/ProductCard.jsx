// src/components/shared/ProductCard.jsx
import React, { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check, Plus } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../../constants/theme";

/* ═══════════════════════════════════════════════
   PRODUCT CARD — single cover image only.
   Carousel lives on the product page.
═══════════════════════════════════════════════ */
const ProductCard = memo(function ProductCard({ product, onAdd, wishlist, toggleWish }) {
  const navigate = useNavigate();
  const [added,  setAdded]  = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const wished = wishlist?.has(product.id);

  const coverImage = product.mainImage || product.imageUrl || product.img || "";

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
      {/* ── Cover Image ── */}
      <div
        onClick={goToProduct}
        style={{ position: "relative", paddingBottom: "125%", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
      >
        {imgErr || !coverImage ? (
          <div className="img-placeholder" style={{ position: "absolute", inset: 0 }} />
        ) : (
          <img
            src={coverImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        )}

        {product.tag && (
          <span style={{
            position: "absolute", top: 12, left: 12, zIndex: 1,
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
              position: "absolute", top: 12, right: 12, zIndex: 1,
              background: "rgba(253,248,245,0.90)", border: "none",
              borderRadius: "50%", width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,196,206,0.95)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.90)"; }}
          >
            <Heart size={14} fill={wished ? C.rose : "none"} color={wished ? C.rose : C.mist} />
          </button>
        )}

        {/* Quick-add overlay on hover */}
        <div
          onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
          className="card-quick-add"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1,
            background: added ? C.rose : "rgba(28,28,28,0.82)",
            color: "#fff",
            fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "13px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: 0, transform: "translateY(4px)",
            transition: "opacity 0.3s ease, transform 0.3s ease, background 0.2s",
            cursor: "pointer",
          }}
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
            cursor: "pointer", transition: "color 0.2s",
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

        {/* Add-ons — display only on card, selectable on product page */}
        {Array.isArray(product.addons) && product.addons.some(a => a?.name) && (
          <div style={{ marginBottom: 8 }}>
            {product.addons.map((addon, i) =>
              addon?.name ? (
                <p key={i} style={{
                  fontFamily: FONT_BODY, fontSize: 11, fontWeight: 400,
                  color: C.mist, lineHeight: 1.5,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ color: C.rose, fontWeight: 500 }}>+</span>
                  {addon.name}
                  {addon.price ? (
                    <span style={{ color: C.slate }}>— PKR {Number(addon.price).toLocaleString()}</span>
                  ) : null}
                </p>
              ) : null
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 400, color: C.slate }}>
            {fmt(product.price)}
          </span>
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
