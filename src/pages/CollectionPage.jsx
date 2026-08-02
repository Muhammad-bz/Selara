// src/pages/CollectionPage.jsx
import React, { useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { useCollection, useAllCollections, useSiteSettings, useReveal } from "../hooks";
import { useCart } from "../context/CartContext";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

import GlobalStyles    from "../components/GlobalStyles";
import SiteHead        from "../components/SiteHead";
import Navbar          from "../components/Navbar";
import Footer          from "../components/Footer";
import CartDrawer      from "../components/CartDrawer";
import ProductCard     from "../components/shared/ProductCard";
import SectionHeader   from "../components/shared/SectionHeader";

/* ═══════════════════════════════════════════════
   COLLECTION PAGE  —  /collection/:slug

   Data flow
   ─────────
   useCollection(slug)  →  collection meta + filtered products[]
   useCart()            →  shared cart/wishlist (same context as every
                            other page — no local cart state)
   useSiteSettings()    →  navbar / footer settings

   States handled
   ──────────────
   loading  →  skeleton hero + product grid shimmer
   error    →  Firestore error screen (retains navbar/footer)
   404      →  category not found after load (retains navbar/footer)
   success  →  hero banner + product grid
═══════════════════════════════════════════════ */

const NAV_H = 60; // matches ProductPage — compact navbar height

export default function CollectionPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  /* ── Data ── */
  const { collection, products, loading, error } = useCollection(slug);
  const { collections: allCollections } = useAllCollections();
  const { settings } = useSiteSettings();
  useReveal();

  /* ── Shared cart + wishlist from context (same as ProductPage) ── */
  const {
    cart, cartOpen, cartBouncing, wishlist, cartCount,
    addToCart, updateQty, removeItem, toggleWish,
    openCart, closeCart, clearCart,
  } = useCart();

  /* ── Stable add handler for ProductCard ── */
  const handleAdd = useCallback((item) => {
    addToCart({ ...item, qty: 1 });
  }, [addToCart]);

  /* ─────────────────────────────────────────────
     SHELL — wraps every state (loading / error / 404 / success)
     Mirrors ProductPage's shell() pattern exactly so the
     navbar, footer, and cart drawer are always present.
  ───────────────────────────────────────────── */
  const shell = (content) => (
    <>
      <SiteHead settings={settings} />
      <GlobalStyles />
      <Navbar
        cartCount={cartCount}
        onCartOpen={openCart}
        cartBouncing={cartBouncing}
        settings={settings}
        forceScrolled
      />
      <main style={{ minHeight: "70vh", paddingTop: NAV_H }}>
        {content}
      </main>
      <Footer settings={settings} />
      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        onOrderSuccess={clearCart}
        settings={settings}
      />
    </>
  );

  /* ─────────────────────────────────────────────
     LOADING — skeleton hero + grid shimmer
  ───────────────────────────────────────────── */
  if (loading) return shell(
    <>
      {/* Hero skeleton */}
      <div
        className="img-placeholder"
        style={{ height: "clamp(320px, 45vw, 520px)", width: "100%" }}
      />

      {/* Grid shimmer */}
      <div style={{ background: C.cream, padding: "56px 24px 80px" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          {/* Header shimmer */}
          <div style={{ marginBottom: 40, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="img-placeholder" style={{ height: 10, width: 80 }} />
            <div className="img-placeholder" style={{ height: 28, width: 240 }} />
            <div className="img-placeholder" style={{ height: 13, width: 320 }} />
          </div>
          <div style={GRID_STYLE}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="img-placeholder"
                style={{ aspectRatio: "4/5", borderRadius: 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ─────────────────────────────────────────────
     FIRESTORE ERROR
  ───────────────────────────────────────────── */
  if (error) return shell(
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: "clamp(20px, 3vw, 28px)",
        fontWeight: 300, color: C.mist, marginBottom: 8,
      }}>
        Unable to load this collection.
      </p>
      <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginBottom: 28 }}>
        {error}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
          letterSpacing: "0.16em", textTransform: "uppercase",
          background: "none", border: `1px solid ${C.line}`,
          color: C.mist, padding: "10px 20px", cursor: "pointer",
          transition: "border-color 0.2s, color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.rose; e.currentTarget.style.color = C.rose; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line;  e.currentTarget.style.color = C.mist; }}
      >
        Try again
      </button>
    </div>
  );

  /* ─────────────────────────────────────────────
     404 — slug resolved but no products match
  ───────────────────────────────────────────── */
  if (!collection) return shell(
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "80px 24px", gap: 16,
    }}>
      <p style={{
        fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
        letterSpacing: "0.28em", textTransform: "uppercase", color: C.rose,
      }}>
        404
      </p>
      <h1 style={{
        fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 5vw, 48px)",
        fontWeight: 300, color: C.charcoal, margin: 0,
      }}>
        Collection not found
      </h1>
      <p style={{
        fontFamily: FONT_BODY, fontSize: 13, color: C.mist,
        maxWidth: 360, lineHeight: 1.7, margin: 0,
      }}>
        The collection you're looking for doesn't exist or may have been renamed.
      </p>
      <Link
        to="/#collections"
        style={{
          marginTop: 8,
          fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.charcoal, textDecoration: "none",
          borderBottom: `1px solid ${C.charcoal}`, paddingBottom: 2,
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.rose; e.currentTarget.style.borderBottomColor = C.rose; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.charcoal; e.currentTarget.style.borderBottomColor = C.charcoal; }}
      >
        Browse all collections
      </Link>
    </div>
  );

  /* ─────────────────────────────────────────────
     SUCCESS
  ───────────────────────────────────────────── */
  const { name, tagline, imageUrl } = collection;

  return shell(
    <>
      {/* ══ HERO BANNER ══════════════════════════════ */}
      <div style={{
        position: "relative",
        height: "clamp(320px, 45vw, 520px)",
        overflow: "hidden",
      }}>
        {/* Cover image */}
        {imageUrl
          ? <img
              src={imageUrl}
              alt={name}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
              }}
            />
          : <div style={{ position: "absolute", inset: 0, background: C.creamDeep }} />
        }

        {/* Gradient scrim — bottom-weighted so text reads cleanly */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(to bottom, rgba(28,28,28,0.10) 0%, rgba(28,28,28,0.58) 100%)",
          pointerEvents: "none",
        }} />

        {/* Text content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 1260, margin: "0 auto",
          padding: "0 24px clamp(40px, 5vw, 64px)",
          height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 400,
              letterSpacing: "0.10em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.60)",
              marginBottom: 18,
            }}
          >
            <Link
              to="/"
              style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; }}
            >
              Home
            </Link>
            <ChevronRight size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            <Link
              to="/#collections"
              style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; }}
            >
              Collections
            </Link>
            <ChevronRight size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            <span style={{ color: "#fff" }}>{name}</span>
          </nav>

          {/* Eyebrow */}
          <p style={{
            fontFamily: FONT_BODY, fontSize: 9, fontWeight: 500,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(242,196,206,0.90)", margin: "0 0 10px",
          }}>
            Collection
          </p>

          {/* Title */}
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(34px, 6vw, 68px)",
            fontWeight: 300, lineHeight: 1.1,
            color: "#fff", margin: "0 0 14px",
            maxWidth: 640,
          }}>
            {name}
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: "clamp(13px, 1.3vw, 15px)",
            fontWeight: 300, lineHeight: 1.7,
            color: "rgba(255,255,255,0.72)",
            margin: 0, maxWidth: 440,
          }}>
            {tagline}
          </p>
        </div>
      </div>

      {/* ══ COLLECTION SWITCHER ══════════════════════ */}
      {allCollections.length > 1 && (
        <CollectionSwitcher
          collections={allCollections}
          currentSlug={slug}
          navigate={navigate}
        />
      )}

      {/* ══ PRODUCT GRID ═════════════════════════════ */}
      <section style={{ background: C.cream, padding: "64px 24px 96px" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "none", border: "none", padding: "0 0 36px",
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 400,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: C.mist, cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.rose; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.mist; }}
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <SectionHeader
            eyebrow={name}
            title={<>The <em style={{ fontStyle: "italic" }}>Full Edit</em></>}
            sub={`Everything in the ${name} collection — ${collection.count} ${collection.count === 1 ? "piece" : "pieces"}.`}
          />

          {/* Grid */}
          {products.length > 0
            ? (
              <div style={GRID_STYLE}>
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={handleAdd}
                    wishlist={wishlist}
                    toggleWish={toggleWish}
                  />
                ))}
              </div>
            )
            : (
              /* Empty category — shouldn't normally reach here since
                 useCollection returns null when count === 0, but
                 guard defensively. */
              <p style={{
                fontFamily: FONT_BODY, fontSize: 13, color: C.mist,
                textAlign: "center", padding: "48px 0",
              }}>
                No products are currently available in this collection.
              </p>
            )
          }
        </div>
      </section>
    </>
  );
}

/* ── Collection Switcher ── */
function CollectionSwitcher({ collections, currentSlug, navigate }) {
  const currentName = currentSlug ? decodeURIComponent(currentSlug) : "";

  return (
    <div style={{
      background: C.creamDeep,
      borderBottom: `1px solid rgba(201,129,143,0.15)`,
    }}>
      <div style={{
        maxWidth: 1260,
        margin: "0 auto",
        padding: "0 24px",
        overflowX: "auto",
        /* Hide scrollbar cross-browser */
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <nav
          aria-label="Switch collection"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            whiteSpace: "nowrap",
          }}
        >
          {collections.map((col) => {
            const isActive =
              col.name.toLowerCase() === currentName.toLowerCase();
            return (
              <button
                key={col.slug}
                onClick={() => {
                  if (!isActive) {
                    navigate(`/collection/${col.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  padding: "14px 20px",
                  cursor: isActive ? "default" : "pointer",
                  fontFamily: FONT_BODY,
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: isActive ? C.rose : C.mist,
                  transition: "color 0.18s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = C.charcoal;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = C.mist;
                }}
              >
                {col.name}
                {/* Active underline */}
                {isActive && (
                  <span style={{
                    position: "absolute",
                    bottom: 0,
                    left: 20,
                    right: 20,
                    height: 1.5,
                    background: C.rose,
                    borderRadius: 1,
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ── Layout constant ── */
const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
  gap: 24,
};
