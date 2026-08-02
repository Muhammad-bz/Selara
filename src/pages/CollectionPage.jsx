// src/pages/CollectionPage.jsx
import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useProducts, useSiteSettings, useReveal } from "../hooks";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

import GlobalStyles from "../components/GlobalStyles";
import SiteHead     from "../components/SiteHead";
import Navbar       from "../components/Navbar";
import Footer       from "../components/Footer";
import CartDrawer   from "../components/CartDrawer";

/* ═══════════════════════════════════════════════
   COLLECTION PAGE  —  /collection/:slug
   Step 3: title + tagline only. Products added later.
═══════════════════════════════════════════════ */
export default function CollectionPage() {
  const { slug }     = useParams();
  const navigate     = useNavigate();

  const [cartOpen,     setCartOpen]     = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [cart,         setCart]         = useState([]);
  const [wishlist,     setWishlist]     = useState(new Set());

  const { products, loading } = useProducts();
  const { settings }          = useSiteSettings();

  useReveal();

  /* ── Derive collection from the slug (= category name, URL-encoded) ── */
  const collection = useMemo(() => {
    if (!products.length) return null;

    // slug is the encoded category name set in CollectionsSection
    const categoryName = decodeURIComponent(slug ?? "");

    // Find every product in this category
    const matches = products.filter(
      (p) => p.category?.trim().toLowerCase() === categoryName.toLowerCase()
    );

    if (!matches.length) return null;

    // Cover image: first available image from any product in the category
    const imageUrl =
      matches.map((p) =>
        p.mainImage ||
        (Array.isArray(p.images) && p.images[0]) ||
        p.imageUrl ||
        p.img ||
        ""
      ).find(Boolean) ?? "";

    const count = matches.length;

    return {
      name:     matches[0].category.trim(),
      tagline:  `${count} ${count === 1 ? "piece" : "pieces"} in this collection`,
      imageUrl,
      count,
    };
  }, [products, slug]);

  /* ── Cart helpers (kept for Navbar + CartDrawer) ── */
  const addToCart = (item) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 450);
  };
  const updateQty  = (id, delta) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <GlobalStyles />
        <SiteHead settings={settings} />
        <Navbar cartCount={0} onCartOpen={() => {}} cartBouncing={false} settings={settings} />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: C.rose, opacity: 0.4,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:.15} 50%{opacity:.9} }`}</style>
        </main>
        <Footer settings={settings} />
      </>
    );
  }

  /* ── 404 — category not found ── */
  if (!loading && !collection) {
    return (
      <>
        <GlobalStyles />
        <SiteHead settings={settings} />
        <Navbar cartCount={0} onCartOpen={() => {}} cartBouncing={false} settings={settings} />
        <main style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 20,
          padding: "64px 24px", textAlign: "center",
        }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.22em", textTransform: "uppercase", color: C.rose }}>
            404
          </p>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 300, color: C.charcoal, margin: 0 }}>
            Collection not found
          </h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, maxWidth: 360, lineHeight: 1.7 }}>
            The collection you're looking for doesn't exist or may have been renamed.
          </p>
          <Link to="/#collections" style={{
            fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.charcoal, textDecoration: "none",
            borderBottom: `1px solid ${C.charcoal}`, paddingBottom: 2,
          }}>
            Browse all collections
          </Link>
        </main>
        <Footer settings={settings} />
      </>
    );
  }

  const { name, tagline, imageUrl } = collection;

  return (
    <>
      <SiteHead settings={{ ...settings, title: `${name} — ${settings?.siteName ?? "Selara"}` }} />
      <GlobalStyles />

      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        cartBouncing={cartBouncing}
        settings={settings}
      />

      <main>
        {/* ── Hero banner ── */}
        <div style={{ position: "relative", minHeight: "clamp(320px, 45vw, 560px)", overflow: "hidden" }}>
          {/* Background image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: C.creamDeep }} />
          )}

          {/* Dark scrim for legibility */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(28,28,28,0.18) 0%, rgba(28,28,28,0.54) 100%)",
          }} />

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 1,
            maxWidth: 1260, margin: "0 auto",
            padding: "clamp(80px,10vw,140px) 24px clamp(48px,6vw,80px)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            height: "100%", minHeight: "clamp(320px, 45vw, 560px)",
            boxSizing: "border-box",
          }}>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 400,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              marginBottom: 20,
            }}>
              <Link
                to="/"
                style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                Home
              </Link>
              <span style={{ opacity: 0.5 }}>›</span>
              <Link
                to="/#collections"
                style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                Collections
              </Link>
              <span style={{ opacity: 0.5 }}>›</span>
              <span style={{ color: "#fff" }}>{name}</span>
            </nav>

            {/* Eyebrow */}
            <p style={{
              fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(242,196,206,0.90)", marginBottom: 12,
            }}>
              Collection
            </p>

            {/* Collection name */}
            <h1 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 16,
              maxWidth: 640,
            }}>
              {name}
            </h1>

            {/* Tagline */}
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: "clamp(13px, 1.4vw, 15px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 480,
            }}>
              {tagline}
            </p>
          </div>
        </div>

        {/* ── Below-hero: placeholder for products (Step 4) ── */}
        <section style={{ background: C.cream, padding: "64px 24px 80px" }}>
          <div style={{
            maxWidth: 1260, margin: "0 auto",
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 32,
          }}>
            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "none", border: "none", padding: 0,
                fontFamily: FONT_BODY, fontSize: 11, fontWeight: 400,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: C.mist, cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.rose; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.mist; }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {/* Step 4 placeholder */}
            <div style={{
              width: "100%",
              border: `1px dashed ${C.line}`,
              borderRadius: 2,
              padding: "56px 32px",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: C.rose, marginBottom: 12,
              }}>
                Coming in Step 4
              </p>
              <p style={{
                fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 300, color: C.charcoal, margin: 0,
              }}>
                Products will appear here
              </p>
              <p style={{
                fontFamily: FONT_BODY, fontSize: 12, color: C.mist,
                marginTop: 8, lineHeight: 1.7,
              }}>
                Filtered to show only <strong style={{ fontWeight: 500, color: C.slate }}>{name}</strong> items.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        onOrderSuccess={() => setCart([])}
        settings={settings}
      />
    </>
  );
}
