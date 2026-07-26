// src/components/shared/ProductCard.jsx
import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check, Plus } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../../constants/theme";

/* Resolve all images for a product */
function resolveImages(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  const single = product.mainImage || product.imageUrl || product.img;
  return single ? [single] : [];
}

/* ═══════════════════════════════════════════════
   PRODUCT CARD
   - Carousel crossfades (no blank flash, no remount)
   - Auto-advances every 6s
   - Add-ons are selectable; price updates live
═══════════════════════════════════════════════ */
const ProductCard = memo(function ProductCard({ product, onAdd, wishlist, toggleWish }) {
  const navigate = useNavigate();
  const [added,          setAdded]          = useState(false);
  const [imgErr,         setImgErr]         = useState(false);
  const [active,         setActive]         = useState(0);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const autoRef = useRef(null);
  const wished  = wishlist?.has(product.id);

  const images  = resolveImages(product);
  const hasMany = images.length > 1;

  // Preload all images on mount so crossfade never flashes
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((idx) => {
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Auto-advance every 6s
  useEffect(() => {
    if (!hasMany) return;
    autoRef.current = setInterval(next, 6000);
    return () => clearInterval(autoRef.current);
  }, [next, hasMany]);

  // Toggle an add-on on/off
  const toggleAddon = useCallback((e, idx) => {
    e.stopPropagation();
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  // Compute total price including selected add-ons
  const addonTotal = Array.isArray(product.addons)
    ? [...selectedAddons].reduce((sum, idx) => {
        const p = Number(product.addons[idx]?.price ?? 0);
        return sum + p;
      }, 0)
    : 0;
  const effectivePrice = (Number(product.price) || 0) + addonTotal;

  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    const chosenAddons = Array.isArray(product.addons)
      ? [...selectedAddons].map((idx) => product.addons[idx]).filter(Boolean)
      : [];
    onAdd({
      ...product,
      qty:          1,
      price:        effectivePrice,   // effective price already includes add-ons
      basePrice:    product.price,    // keep original for reference
      selectedAddons: chosenAddons,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [onAdd, product, selectedAddons, effectivePrice]);

  const handleToggleWish = useCallback((e) => {
    e.stopPropagation();
    toggleWish?.(product.id);
  }, [toggleWish, product.id]);

  const goToProduct = useCallback(() => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, product.id]);

  const hasAddons = Array.isArray(product.addons) && product.addons.some((a) => a?.name);

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
      {/* ── Image / Crossfade Carousel — clickable ── */}
      <div
        onClick={goToProduct}
        style={{ position: "relative", paddingBottom: "125%", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
      >
        {imgErr || images.length === 0 ? (
          <div className="img-placeholder" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        ) : (
          <>
            {/* Stack ALL images; only the active one is visible — pure CSS crossfade, no remount */}
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === 0 ? product.name : ""}
                loading="eager"
                decoding="async"
                onError={() => { if (i === 0) setImgErr(true); }}
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  opacity: i === active ? 1 : 0,
                  transition: "opacity 0.8s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                  willChange: "opacity, transform",
                  zIndex: i === active ? 1 : 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              />
            ))}
          </>
        )}

        {product.tag && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: C.rose, color: "#fff",
            fontFamily: FONT_BODY, fontSize: 8, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "5px 10px", zIndex: 2,
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
              zIndex: 2,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,196,206,0.95)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.90)"; }}
          >
            <Heart size={14} fill={wished ? C.rose : "none"} color={wished ? C.rose : C.mist} />
          </button>
        )}

        {/* Dot indicators */}
        {hasMany && (
          <div
            style={{
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
            cursor: "pointer", zIndex: 3,
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
            color: C.mist, lineHeight: 1.6, marginBottom: 10,
          }}>
            {product.desc}
          </p>
        )}

        {/* ── Selectable Add-ons ── */}
        {hasAddons && (
          <div style={{ marginBottom: 10 }}>
            {product.addons.map((addon, i) =>
              addon?.name ? (
                <div
                  key={i}
                  onClick={(e) => toggleAddon(e, i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "5px 7px",
                    marginBottom: 3,
                    borderRadius: 4,
                    border: `1px solid ${selectedAddons.has(i) ? C.rose : "transparent"}`,
                    background: selectedAddons.has(i) ? "rgba(242,196,206,0.18)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.18s, border-color 0.18s",
                  }}
                >
                  {/* Custom checkbox */}
                  <span style={{
                    width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                    border: `1.5px solid ${selectedAddons.has(i) ? C.rose : C.mist}`,
                    background: selectedAddons.has(i) ? C.rose : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.18s, border-color 0.18s",
                  }}>
                    {selectedAddons.has(i) && (
                      <Check size={8} color="#fff" strokeWidth={3} />
                    )}
                  </span>
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: 11, fontWeight: 400,
                    color: selectedAddons.has(i) ? C.rose : C.mist,
                    flex: 1, transition: "color 0.18s",
                  }}>
                    {addon.name}
                  </span>
                  {addon.price ? (
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: 11, fontWeight: 500,
                      color: selectedAddons.has(i) ? C.rose : C.slate,
                      flexShrink: 0, transition: "color 0.18s",
                    }}>
                      +PKR {Number(addon.price).toLocaleString()}
                    </span>
                  ) : null}
                </div>
              ) : null
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <div>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 400, color: C.slate }}>
              {fmt(effectivePrice)}
            </span>
            {addonTotal > 0 && (
              <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: C.mist, marginLeft: 5 }}>
                incl. add-ons
              </span>
            )}
          </div>
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
