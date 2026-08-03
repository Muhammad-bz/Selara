// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

/* ═══════════════════════════════════════════════
   CART CONTEXT
   - Cart persists to localStorage under "selara_cart"
   - Wishlist is in-memory only (not persisted)
   - All state: cart, cartOpen, cartBouncing, wishlist
   - All actions: addToCart, updateQty, removeItem,
     toggleWish, openCart, closeCart, clearCart
═══════════════════════════════════════════════ */

const CART_KEY = "selara_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // storage full or private mode — fail silently
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart,         setCartRaw]     = useState(loadCart);
  const [cartOpen,     setCartOpen]    = useState(false);
  const [cartBouncing, setBouncing]    = useState(false);
  const [wishlist,     setWishlist]    = useState(new Set());

  /* Sync to localStorage whenever cart changes */
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const setCart = useCallback((updater) => {
    setCartRaw(updater);
  }, []);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      /* Match by id + selectedSize + addon combo */
      const key = `${item.id}__${item.selectedSize ?? ""}__${(item.selectedAddons ?? []).map(a => a.name).join(",")}`;
      const existing = prev.find((i) => {
        const iKey = `${i.id}__${i.selectedSize ?? ""}__${(i.selectedAddons ?? []).map(a => a.name).join(",")}`;
        return iKey === key;
      });
      if (existing) {
        return prev.map((i) => {
          const iKey = `${i.id}__${i.selectedSize ?? ""}__${(i.selectedAddons ?? []).map(a => a.name).join(",")}`;
          return iKey === key ? { ...i, qty: i.qty + (item.qty ?? 1) } : i;
        });
      }
      return [...prev, { ...item, qty: item.qty ?? 1 }];
    });
    setBouncing(true);
    setTimeout(() => setBouncing(false), 450);
  }, [setCart]);

  const updateQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }, [setCart]);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const toggleWish = useCallback((id) => {
    setWishlist((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const openCart  = useCallback(() => setCartOpen(true),  []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value = useMemo(() => ({
    cart, cartOpen, cartBouncing, wishlist, cartCount,
    addToCart, updateQty, removeItem, toggleWish,
    openCart, closeCart, clearCart,
  }), [
    cart, cartOpen, cartBouncing, wishlist, cartCount,
    addToCart, updateQty, removeItem, toggleWish,
    openCart, closeCart, clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
