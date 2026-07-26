// src/pages/ProductPage.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ArrowLeft, Check, Minus, Plus, ChevronRight, ChevronLeft, Maximize2, X } from "lucide-react";

import { useProducts, useSiteSettings, useReveal } from "../hooks";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../constants/theme";
import { useCart } from "../context/CartContext";

import GlobalStyles from "../components/GlobalStyles";
import SiteHead     from "../components/SiteHead";
import Navbar       from "../components/Navbar";
import Footer       from "../components/Footer";
import CartDrawer   from "../components/CartDrawer";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* Checks images[], mainImage, imageUrl, img — in priority order */
function getImages(product) {
  if (!product) return [];
  // Prefer the images array (set by the multi-image admin)
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  // mainImage alone (edge case where images[] wasn't saved)
  if (product.mainImage) return [product.mainImage];
  // Legacy single-image fields
  const single = product.imageUrl || product.img;
  if (single) return [single];
  return [];
}

/* ─────────────────────────────────────────────
   IMAGE CAROUSEL
───────────────────────────────────────────── */
function ImageCarousel({ images, alt, tag }) {
  const [active,   setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const autoRef  = useRef(null);
  const touchRef = useRef(null);

  useEffect(() => { setActive(0); }, [images]);

  // Preload all images upfront so crossfade never shows blank
  useEffect(() => {
    images.forEach((src) => { const img = new Image(); img.src = src; });
  }, [images]);

  const goTo = useCallback((idx) => {
    setActive(idx);
  }, []);

  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);

  /* Auto-advance every 6s */
  useEffect(() => {
    if (images.length < 2) return;
    autoRef.current = setInterval(next, 6000);
    return () => clearInterval(autoRef.current);
  }, [next, images.length]);

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (images.length > 1) autoRef.current = setInterval(next, 6000);
  }, [next, images.length]);

  /* Swipe */
  const onTouchStart = (e) => { touchRef.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchRef.current;
    touchRef.current = null;
    if (Math.abs(dx) < 40) return;
    resetAuto();
    dx < 0 ? next() : prev();
  };

  /* Keyboard in lightbox */
  useEffect(() => {
    if (!lightbox) return;
    const h = (e) => {
      if (e.key === "ArrowRight") { resetAuto(); next(); }
      if (e.key === "ArrowLeft")  { resetAuto(); prev(); }
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, next, prev, resetAuto]);

  /* Body scroll lock in lightbox */
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (images.length === 0) {
    return <div style={{ paddingBottom: "130%", background: C.creamDeep }} />;
  }

  return (
    <>
      {/* ── Main slide ── */}
      <div
        style={{ position: "relative", overflow: "hidden", background: C.creamDeep, userSelect: "none" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ position: "relative", paddingBottom: "130%" }}>
          {/* All images stacked — opacity crossfade, no remount, no blank flash */}
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={i === 0 ? alt : ""}
              loading="eager"
              decoding="async"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                opacity: i === active ? 1 : 0,
                transition: "opacity 0.75s ease",
                zIndex: i === active ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Tag */}
        {tag && (
          <span style={{
            position: "absolute", top: 14, left: 14, zIndex: 2,
            background: C.rose, color: "#fff",
            fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
            letterSpacing: "0.16em", textTransform: "uppercase",
            padding: "5px 12px",
          }}>
            {tag}
          </span>
        )}

        {/* Fullscreen */}
        <button
          onClick={() => setLightbox(true)}
          aria-label="View fullscreen"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2,
            background: "rgba(253,248,245,0.85)", border: "none",
            width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.85)"; }}
        >
          <Maximize2 size={15} color={C.charcoal} />
        </button>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={() => { resetAuto(); prev(); }} aria-label="Previous"
              style={arrowBtn("left")}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.80)"; }}>
              <ChevronLeft size={18} color={C.charcoal} />
            </button>
            <button onClick={() => { resetAuto(); next(); }} aria-label="Next"
              style={arrowBtn("right")}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.80)"; }}>
              <ChevronRight size={18} color={C.charcoal} />
            </button>
          </>
        )}

        {/* Pill dots */}
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 14, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 5, zIndex: 2,
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => { resetAuto(); goTo(i); }}
                aria-label={`Image ${i + 1}`}
                style={{
                  width: i === active ? 20 : 6, height: 6,
                  background: i === active ? C.rose : "rgba(253,248,245,0.60)",
                  border: "none", padding: 0, cursor: "pointer",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{
          display: "flex", gap: 6, marginTop: 8,
          overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2,
        }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => { resetAuto(); goTo(i); }}
              style={{
                flexShrink: 0, width: 60, height: 60,
                border: `2px solid ${i === active ? C.rose : "transparent"}`,
                padding: 0, cursor: "pointer", overflow: "hidden",
                background: C.creamDeep, transition: "border-color 0.2s",
              }}
            >
              <img src={src} alt="" loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(10,8,6,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => {
            if (touchRef.current === null) return;
            const dx = e.changedTouches[0].clientX - touchRef.current;
            touchRef.current = null;
            if (Math.abs(dx) < 40) return;
            resetAuto(); dx < 0 ? next() : prev();
          }}
        >
          {/* Close */}
          <button onClick={() => setLightbox(false)} aria-label="Close"
            style={{
              position: "absolute", top: 20, right: 20, zIndex: 2,
              background: "rgba(253,248,245,0.10)", border: "none",
              width: 44, height: 44, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.10)"; }}
          >
            <X size={20} color="#fff" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <p style={{
              position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)",
              fontFamily: FONT_BODY, fontSize: 11, letterSpacing: "0.14em",
              color: "rgba(253,248,245,0.40)", pointerEvents: "none",
            }}>
              {active + 1} / {images.length}
            </p>
          )}

          {/* Full image */}
          <img
            src={images[active]} alt={`${alt} ${active + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              objectFit: "contain",
              transition: "opacity 0.3s ease",
              userSelect: "none",
            }}
          />

          {/* Lightbox arrows */}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); resetAuto(); prev(); }}
                aria-label="Previous" style={lbArrowBtn("left")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.08)"; }}>
                <ChevronLeft size={24} color="#fff" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); resetAuto(); next(); }}
                aria-label="Next" style={lbArrowBtn("right")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(253,248,245,0.08)"; }}>
                <ChevronRight size={24} color="#fff" />
              </button>
            </>
          )}

          {/* Lightbox dots */}
          {images.length > 1 && (
            <div style={{
              position: "absolute", bottom: 24, left: "50%",
              transform: "translateX(-50%)",
              display: "flex", gap: 8,
            }}>
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); resetAuto(); goTo(i); }}
                  style={{
                    width: i === active ? 24 : 7, height: 7,
                    background: i === active ? C.rose : "rgba(253,248,245,0.30)",
                    border: "none", padding: 0, cursor: "pointer",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

const arrowBtn = (side) => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  [side]: 10, zIndex: 2,
  background: "rgba(253,248,245,0.80)", border: "none",
  width: 36, height: 36,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.2s",
});

const lbArrowBtn = (side) => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  [side]: 16, zIndex: 2,
  background: "rgba(253,248,245,0.08)", border: "none",
  width: 48, height: 48,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.2s",
});

/* ─────────────────────────────────────────────
   RELATED CARD
───────────────────────────────────────────── */
function RelatedCard({ product, onAdd }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    onAdd({ ...product, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }, [onAdd, product]);

  const thumb = product.imageUrl || product.img;

  return (
    <div
      onClick={() => { navigate(`/product/${product.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      style={{ cursor: "pointer", background: C.cream, border: `1px solid ${C.line}`, overflow: "hidden", transition: "box-shadow 0.25s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,129,143,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "relative", paddingBottom: "120%", overflow: "hidden" }}>
        {thumb ? (
          <img src={thumb} alt={product.name} loading="lazy" decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="img-placeholder" style={{ position: "absolute", inset: 0 }} />
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400, color: C.charcoal, marginBottom: 4 }}>
          {product.name}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.slate }}>{fmt(product.price)}</span>
          <button onClick={handleAdd} style={{
            background: added ? C.rose : C.charcoal, color: "#fff", border: "none",
            padding: "7px 12px", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {added ? <><Check size={10} /> Added</> : <><Plus size={10} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCT PAGE
═══════════════════════════════════════════════ */
export default function ProductPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { settings }                 = useSiteSettings();
  useReveal();

  const {
    cart, cartOpen, cartBouncing, wishlist, cartCount,
    addToCart, updateQty, removeItem, toggleWish,
    openCart, closeCart, clearCart,
  } = useCart();

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [products, id]
  );
  const images = useMemo(() => getImages(product), [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  }, [products, product]);

  const [selectedSize,   setSelectedSize]   = useState(null);
  const [qty,            setQty]            = useState(1);
  const [added,          setAdded]          = useState(false);
  const [sizeError,      setSizeError]      = useState(false);
  const [selectedAddons, setSelectedAddons] = useState(new Set());

  useEffect(() => {
    setSelectedSize(null); setQty(1); setAdded(false); setSizeError(false); setSelectedAddons(new Set());
  }, [id]);

  const toggleAddon = useCallback((idx) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const addonTotal = useMemo(() => {
    if (!product?.addons) return 0;
    return [...selectedAddons].reduce((sum, idx) => sum + (Number(product.addons[idx]?.price) || 0), 0);
  }, [selectedAddons, product]);

  const hasSizes = product?.sizes?.length > 0;
  const wished   = wishlist.has(product?.id);

  const handleAdd = useCallback(() => {
    if (hasSizes && !selectedSize) { setSizeError(true); return; }
    const chosenAddons = Array.isArray(product?.addons)
      ? [...selectedAddons]
          .map((idx) => product.addons[idx])
          .filter((a) => a && (a.name != null || a.title != null))
      : [];
    addToCart({
      ...product,
      selectedSize,
      qty,
      price:          (Number(product.price) || 0) + addonTotal,
      basePrice:      product.price,
      selectedAddons: chosenAddons,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addToCart, product, selectedSize, qty, hasSizes, selectedAddons, addonTotal]);

  /* ── Shared navbar + shell ── */
  /* forceScrolled makes the navbar render in its "scrolled" (dark, compact) 
     state from the very first paint — no scroll required.
     paddingTop: 60px matches the compact navbar height exactly:
     14px top pad + 32px logo + 14px bottom pad = 60px */
  const NAV_H = 60;

  const shell = (content) => (
    <>
      <SiteHead settings={settings} />
      <GlobalStyles />
      <Navbar cartCount={cartCount} onCartOpen={openCart}
        cartBouncing={cartBouncing} settings={settings} forceScrolled />
      <main style={{ minHeight: "70vh", paddingTop: NAV_H }}>{content}</main>
      <Footer settings={settings} />
      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart}
        updateQty={updateQty} removeItem={removeItem} onOrderSuccess={clearCart} settings={settings} />
    </>
  );

  if (loading) return shell(
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 48 }}>
        <div className="img-placeholder" style={{ paddingBottom: "130%", position: "relative" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          {[220, 100, 80, 140, 48].map((w, i) => (
            <div key={i} className="img-placeholder" style={{ height: 18, width: w }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return shell(
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 300, color: C.mist }}>
        Unable to load this product.
      </p>
    </div>
  );

  if (!product) return shell(
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <p style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 300, color: C.charcoal, marginBottom: 8 }}>
        Product not found
      </p>
      <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginBottom: 32 }}>
        This item may no longer be available.
      </p>
      <Link to="/#menu" style={{
        fontFamily: FONT_BODY, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em",
        textTransform: "uppercase", color: C.charcoal, textDecoration: "none",
        borderBottom: `1px solid ${C.charcoal}`, paddingBottom: 2,
      }}>
        View all products
      </Link>
    </div>
  );

  return (
    <>
      <SiteHead settings={settings} />
      <GlobalStyles />

      {/* Always dark navbar from first paint */}
      <Navbar
        cartCount={cartCount} onCartOpen={openCart}
        cartBouncing={cartBouncing} settings={settings}
        forceScrolled
      />

      <main style={{ paddingTop: NAV_H }}>

        {/* ── Breadcrumb + back ── */}
        <div style={{ background: C.cream, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            {/* Back */}
            <button onClick={() => navigate(-1)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.12em", color: C.mist, padding: 0,
              textTransform: "uppercase", transition: "color 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.charcoal; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.mist; }}
            >
              <ArrowLeft size={12} /> Back
            </button>
            {/* Breadcrumb */}
            <nav style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Link to="/" style={crumbStyle}>Home</Link>
              <ChevronRight size={10} color={C.mist} />
              <Link to="/#menu" style={crumbStyle}>{product.category || "Shop"}</Link>
              <ChevronRight size={10} color={C.mist} />
              <span style={{ ...crumbStyle, color: C.charcoal, cursor: "default" }}>{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ── Main product layout ── */}
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "clamp(24px, 4vw, 56px) 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "clamp(24px, 5vw, 72px)",
          alignItems: "start",
        }}>

          {/* Left: Carousel */}
          <div>
            <ImageCarousel images={images} alt={product.name} tag={product.tag} />
          </div>

          {/* Right: Info */}
          <div style={{ paddingTop: 4 }}>

            {product.category && (
              <p style={{
                fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.rose, marginBottom: 10,
              }}>
                {product.category}
              </p>
            )}

            <h1 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 300,
              fontSize: "clamp(26px, 4vw, 44px)",
              color: C.charcoal, lineHeight: 1.1, marginBottom: 14,
            }}>
              {product.name}
            </h1>

            <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 10 }}>
              <p style={{
                fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 400,
                color: C.slate, margin: 0,
              }}>
                {fmt((Number(product.price) || 0) + addonTotal)}
              </p>
              {addonTotal > 0 && (
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>
                  incl. add-ons
                </span>
              )}
            </div>

            {/* ── Selectable Add-ons ── */}
            {Array.isArray(product.addons) && product.addons.filter(a => a?.name).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: C.charcoal, marginBottom: 12,
                }}>
                  Add-ons
                </p>
                {product.addons.map((addon, i) =>
                  addon?.name ? (
                    <div
                      key={i}
                      onClick={() => toggleAddon(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", marginBottom: 6,
                        border: `1px solid ${selectedAddons.has(i) ? C.rose : C.line}`,
                        background: selectedAddons.has(i) ? "rgba(242,196,206,0.15)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.18s, border-color 0.18s",
                      }}
                    >
                      {/* Checkbox */}
                      <span style={{
                        width: 16, height: 16, flexShrink: 0, borderRadius: 3,
                        border: `1.5px solid ${selectedAddons.has(i) ? C.rose : C.mist}`,
                        background: selectedAddons.has(i) ? C.rose : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.18s, border-color 0.18s",
                      }}>
                        {selectedAddons.has(i) && <Check size={10} color="#fff" strokeWidth={3} />}
                      </span>

                      {/* Addon image if available */}
                      {addon.imageUrl && (
                        <img
                          src={addon.imageUrl} alt={addon.name}
                          style={{ width: 40, height: 40, objectFit: "cover", border: `1px solid ${C.line}`, flexShrink: 0 }}
                        />
                      )}

                      {/* Name */}
                      <span style={{
                        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 400,
                        color: selectedAddons.has(i) ? C.charcoal : C.mist,
                        flex: 1, transition: "color 0.18s",
                      }}>
                        {addon.name}
                      </span>

                      {/* Price */}
                      {addon.price ? (
                        <span style={{
                          fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
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

            <div style={{ height: 1, background: C.line, marginBottom: 24 }} />

            {product.desc && (
              <p style={{
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 300,
                color: C.mist, lineHeight: 1.8, marginBottom: 28,
              }}>
                {product.desc}
              </p>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div style={{ marginBottom: 28 }}>
                <p style={{
                  fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: C.charcoal, marginBottom: 12,
                }}>
                  Size{selectedSize && <span style={{ color: C.rose, fontWeight: 400 }}> — {selectedSize}</span>}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(product.sizes || SIZES).map((sz) => {
                    const isActive = selectedSize === sz;
                    return (
                      <button key={sz}
                        onClick={() => { setSelectedSize(sz); setSizeError(false); }}
                        style={{
                          width: 48, height: 48,
                          border: `1px solid ${isActive ? C.rose : C.line}`,
                          background: isActive ? C.rose : "transparent",
                          color: isActive ? "#fff" : C.mist,
                          fontFamily: FONT_BODY, fontSize: 12, fontWeight: 400,
                          letterSpacing: "0.06em", cursor: "pointer",
                          transition: "background 0.18s, color 0.18s, border-color 0.18s",
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#c0392b", marginTop: 8 }}>
                    Please select a size.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.charcoal, marginBottom: 12,
              }}>
                Quantity
              </p>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.line}`, width: "fit-content" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" style={qtyBtnStyle}>
                  <Minus size={13} />
                </button>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400,
                  color: C.charcoal, minWidth: 40, textAlign: "center",
                }}>
                  {qty}
                </span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" style={qtyBtnStyle}>
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24 }}>
              <button onClick={handleAdd} style={{
                flex: 1, background: added ? C.rose : C.charcoal,
                color: "#fff", border: "none",
                padding: "15px 24px",
                fontFamily: FONT_BODY, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: "pointer", transition: "background 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
                onMouseEnter={(e) => { if (!added) e.currentTarget.style.background = C.rose; }}
                onMouseLeave={(e) => { if (!added) e.currentTarget.style.background = C.charcoal; }}
              >
                {added ? <><Check size={14} /> Added to cart</> : "Add to cart"}
              </button>

              <button onClick={() => toggleWish(product.id)}
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                style={{
                  width: 52, height: 52, flexShrink: 0,
                  border: `1px solid ${wished ? C.rose : C.line}`,
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.rose; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = wished ? C.rose : C.line; }}
              >
                <Heart size={18} fill={wished ? C.rose : "none"} color={wished ? C.rose : C.mist} />
              </button>
            </div>

            <div style={{ height: 1, background: C.line, marginBottom: 18 }} />
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, letterSpacing: "0.04em", lineHeight: 1.7 }}>
              Free delivery on orders over PKR 3,000 · Easy 7-day returns
            </p>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section style={{ background: C.creamDeep, padding: "60px 24px 72px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{
                marginBottom: 32, paddingBottom: 18,
                borderBottom: `1px solid ${C.line}`,
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              }}>
                <div>
                  <p style={{
                    fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    color: C.rose, marginBottom: 6,
                  }}>
                    From the same collection
                  </p>
                  <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 300, color: C.charcoal }}>
                    You might also like
                  </h2>
                </div>
                <Link to="/#menu" style={{
                  fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.charcoal, textDecoration: "none",
                  borderBottom: `1px solid ${C.charcoal}`, paddingBottom: 2,
                  whiteSpace: "nowrap", transition: "color 0.2s, border-color 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.rose; e.currentTarget.style.borderColor = C.rose; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.charcoal; e.currentTarget.style.borderColor = C.charcoal; }}
                >
                  View all
                </Link>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
                gap: 20,
              }}>
                {related.map((p) => <RelatedCard key={p.id} product={p} onAdd={addToCart} />)}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer settings={settings} />
      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart}
        updateQty={updateQty} removeItem={removeItem} onOrderSuccess={clearCart} settings={settings} />
    </>
  );
}

/* ── style constants ── */
const crumbStyle = {
  fontFamily: "inherit", fontSize: 11, color: C.mist,
  textDecoration: "none", letterSpacing: "0.04em", transition: "color 0.15s",
};

const qtyBtnStyle = {
  background: "none", border: "none", width: 44, height: 44,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: C.mist, transition: "color 0.15s",
};
