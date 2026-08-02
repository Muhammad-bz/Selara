// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import { CartProvider }  from "./context/CartContext";

import PublicSite       from "./pages/PublicPage.jsx";
import ProductPage      from "./pages/ProductPage.jsx";
import CollectionPage   from "./pages/CollectionPage.jsx";        // ← NEW
import AdminLogin       from "./components/admin/AdminLogin.jsx";
import ProtectedRoute   from "./components/admin/ProtectedRoute.jsx";
import AdminLayout      from "./pages/admin/AdminLayout.jsx";
import Dashboard        from "./pages/admin/Dashboard.jsx";
import Products         from "./pages/admin/Products.jsx";
import Categories       from "./pages/admin/Categories.jsx";
import Orders           from "./pages/admin/Orders.jsx";
import Settings         from "./pages/admin/Settings.jsx";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* ── Admin: public login ─────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Admin: protected nested routes ──────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index               element={<Dashboard  />} />
          <Route path="products"     element={<Products   />} />
          <Route path="categories"   element={<Categories />} />
          <Route path="orders"       element={<Orders     />} />
          <Route path="settings"     element={<Settings   />} />
        </Route>

        {/* ── Product detail page ──────────────────────────── */}
        <Route path="/product/:id"       element={<ProductPage    />} />

        {/* ── Collection page ──────────────────────────────── */}
        <Route path="/collection/:slug"  element={<CollectionPage />} />

        {/* ── Public customer-facing website ──────────────── */}
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </CartProvider>
  );
}
