// src/pages/PublicPage.jsx
import React, { useState, useCallback, useMemo } from "react";

// Hooks
import { useProducts, useSiteSettings, useReveal } from "../hooks";

// Global infrastructure
import GlobalStyles from "../components/GlobalStyles";
import SiteHead from "../components/SiteHead";

// Layout components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Section components
import HeroSection        from "../components/HeroSection";
import TrustStrip         from "../components/TrustStrip";
import FeaturedSection    from "../components/FeaturedSection";
import CollectionsSection from "../components/CollectionsSection";
import AboutSection       from "../components/AboutSection";

// Cart & checkout
import CartDrawer from "../components/CartDrawer";

/* ═══════════════════════════════════════════════
   PUBLIC SITE (customer-facing, no auth required)
═══════════════════════════════════════════════ */
export default function PublicPage() {
  const [cartOpen,     setCartOpen]     = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [cart,         setCart]         = useState([]);
  const [wishlist,     setWishlist]     = useState(new Set());

  const { products, loading, error } = useProducts();
  const { settings }                 = useSiteSettings();

  useReveal();

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 450);
  }, []);

  const updateQty  = useCallback((id, delta) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
  []);

  const removeItem = useCallback((id) =>
    setCart((prev) => prev.filter((i) => i.id !== id)),
  []);

  const toggleWish = useCallback((id) =>
    setWishlist((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    }),
  []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const openCart  = useCallback(() => setCartOpen(true),  []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const clearCart = useCallback(() => setCart([]), []);

  return (
    <>
      <SiteHead settings={settings} />
      <GlobalStyles />

      <Navbar
        cartCount={cartCount}
        onCartOpen={openCart}
        cartBouncing={cartBouncing}
        settings={settings}
      />

      <main>
        <HeroSection settings={settings} />
        <TrustStrip />

        {/* ── Featured picks ── */}
        <FeaturedSection
          onAdd={addToCart}
          wishlist={wishlist}
          toggleWish={toggleWish}
          products={products}
          loading={loading}
          error={error}
        />

        {/* ── Shop by Category — CollectionCard grid ── */}
        <CollectionsSection products={products} loading={loading} />

        <AboutSection settings={settings} />
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
}
