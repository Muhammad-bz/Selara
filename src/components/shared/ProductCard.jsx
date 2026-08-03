// src/components/shared/ProductCard.jsx
import React, { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, X, Minus } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../../constants/theme";

/* ═══════════════════════════════════════════════
   PRODUCT CARD
   "+ Add" opens a size/addon picker modal.
   No wishlist.
═══════════════════════════════════════════════ */
const ProductCard = memo(function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const [imgErr,     setImgErr]     = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [added,      setAdded]      = useState(false);

  /* Modal state */
  const [selectedSize,   setSelectedSize]   = useState(null);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const [qty,            setQty]            = useState(1);
  const [sizeError,      setSizeError]      = useState(false);

  const coverImage = product.mainImage || product.imageUrl || product.img || "";
  const hasSizes   = Array.isArray(product.sizes) && product.sizes.length > 0;
  const hasAddons  = Array.isArray(product.addons) && product.addons.some(a => a?.name);

  const addonTotal = [...selectedAddons].reduce(
    (sum, idx) => sum + (Number(product.addons?.[idx]?.price) || 0), 0
  );
  const lineTotal = (product.price + addonTotal) * qty;

  const goToProduct = useCallback(() => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, product.id]);

  const openModal = useCallback((e) => {
    e.stopPropagation();
    /* If product has no sizes and no addons, add directly */
    if (!hasSizes && !hasAddons) {
      onAdd({ ...product, qty: 1, selectedSize: null, selectedAddons: [] });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      return;
    }
    setSelectedSize(null);
    setSelectedAddons(new Set());
    setQty(1);
    setSizeError(false);
    setModalOpen(true);
  }, [hasSizes, hasAddons, onAdd, product]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const toggleAddon = useCallback((idx) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (hasSizes && !selectedSize) { setSizeError(true); return; }

    const chosenAddons = [...selectedAddons]
      .map((idx) => product.addons[idx])
      .filter((a) => a?.name);

    onAdd({
      ...product,
      price:          product.price + addonTotal,
      basePrice:      product.price,
      qty,
      selectedSize,
      selectedAddons: chosenAddons,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setModalOpen(false);
  }, [hasSizes, selectedSize, selectedAddons, qty, addonTotal, onAdd, product]);

  return (
    <>
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

          {/* Quick-add overlay on hover */}
          <div
            onClick={openModal}
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

          {/* Add-ons preview */}
          {hasAddons && (
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
              onClick={openModal}
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

      {/* ══════════════════════════════════════════
          SIZE & ADDON PICKER MODAL
      ══════════════════════════════════════════ */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            style={{
              position: "fixed", inset: 0, zIndex: 3000,
              background: "rgba(28,20,14,0.55)",
              animation: "fadeIn 0.2s ease",
            }}
          />

          {/* Sheet */}
          <div style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            zIndex: 3001,
            background: C.cream,
            borderRadius: "16px 16px 0 0",
            padding: "0 0 env(safe-area-inset-bottom, 16px)",
            maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            animation: "slideUp 0.28s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 -8px 48px rgba(28,20,14,0.18)",
          }}>

            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, background: C.line, borderRadius: 2 }} />
            </div>

            {/* Header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "12px 20px 14px",
              borderBottom: `1px solid ${C.line}`,
              flexShrink: 0,
            }}>
              <div>
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 400, color: C.charcoal, marginBottom: 2 }}>
                  {product.name}
                </p>
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.slate }}>
                  {fmt(product.price)}
                </p>
              </div>
              <button onClick={closeModal} style={{
                background: C.creamDeep, border: "none", borderRadius: "50%",
                width: 32, height: 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <X size={14} color={C.mist} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px" }}>

              {/* ── Size picker ── */}
              {hasSizes && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontFamily: FONT_BODY, fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: sizeError ? "#C0392B" : C.mist, marginBottom: 12,
                  }}>
                    {sizeError ? "Please select a size" : "Select Size *"}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {product.sizes.map((s) => {
                      const sel = selectedSize === s;
                      return (
                        <button
                          key={s}
                          onClick={() => { setSelectedSize(s); setSizeError(false); }}
                          style={{
                            minWidth: 48, height: 44, padding: "0 14px",
                            border: `1.5px solid ${sel ? C.charcoal : C.line}`,
                            background: sel ? C.charcoal : "transparent",
                            color: sel ? "#fff" : C.charcoal,
                            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 500,
                            cursor: "pointer", transition: "all 0.18s",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Addon picker ── */}
              {hasAddons && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontFamily: FONT_BODY, fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: C.mist, marginBottom: 12,
                  }}>
                    Add-ons <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>(optional)</span>
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {product.addons.map((addon, idx) => {
                      if (!addon?.name) return null;
                      const sel = selectedAddons.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleAddon(idx)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 14px",
                            border: `1.5px solid ${sel ? C.rose : C.line}`,
                            background: sel ? "rgba(201,129,143,0.06)" : "transparent",
                            cursor: "pointer", textAlign: "left",
                            transition: "border-color 0.18s, background 0.18s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: "50%",
                              border: `1.5px solid ${sel ? C.rose : C.line}`,
                              background: sel ? C.rose : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, transition: "all 0.18s",
                            }}>
                              {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                            <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.charcoal }}>
                              {addon.name}
                            </span>
                          </div>
                          {addon.price ? (
                            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.rose, fontWeight: 500 }}>
                              + PKR {Number(addon.price).toLocaleString()}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Quantity ── */}
              <div style={{ marginBottom: 8 }}>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 9, fontWeight: 600,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: C.mist, marginBottom: 12,
                }}>
                  Quantity
                </p>
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `1px solid ${C.line}`, width: "fit-content",
                }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={qtyBtn}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{
                    fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400,
                    color: C.charcoal, minWidth: 40, textAlign: "center",
                  }}>
                    {qty}
                  </span>
                  <button onClick={() => setQty((q) => q + 1)} style={qtyBtn}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>

            </div>

            {/* Footer — confirm button */}
            <div style={{
              padding: "14px 20px 20px",
              borderTop: `1px solid ${C.line}`,
              flexShrink: 0,
            }}>
              <button
                onClick={handleConfirm}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <span>Add to Cart</span>
                <span>{fmt(lineTotal)}</span>
              </button>
            </div>
          </div>

          {/* slideUp keyframe — injected inline once */}
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
});

export default ProductCard;

const qtyBtn = {
  background: "none", border: "none", width: 44, height: 44,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: C.mist, transition: "color 0.15s",
};
