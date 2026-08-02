// src/components/CollectionsSection.jsx
import React, { useMemo } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";
import SectionHeader from "./shared/SectionHeader";
import CollectionCard from "./shared/CollectionCard";

/* ═══════════════════════════════════════════════
   COLLECTIONS SECTION
   Derives one CollectionCard per unique product category
   from the live products array passed down from PublicPage.

   • No extra Firestore fetch — reuses the products already loaded.
   • Clicking a card scrolls to #menu and filters by that category
     via ?category= in the URL hash (no routing change needed).
   • Image: first product image found in that category.
   • Tagline: product count for that category.
═══════════════════════════════════════════════ */
export default function CollectionsSection({ products, loading }) {
  /* ── Build one collection object per unique category ── */
  const collections = useMemo(() => {
    if (!products?.length) return [];

    const map = new Map(); // category name → { imageUrl, count }

    products.forEach((p) => {
      const cat = p.category?.trim();
      if (!cat) return;

      if (!map.has(cat)) {
        const img =
          p.mainImage ||
          (Array.isArray(p.images) && p.images[0]) ||
          p.imageUrl ||
          p.img ||
          "";
        map.set(cat, { imageUrl: img, count: 1 });
      } else {
        const entry = map.get(cat);
        entry.count += 1;
        // Upgrade to a real image if the first product had none
        if (!entry.imageUrl) {
          entry.imageUrl =
            p.mainImage ||
            (Array.isArray(p.images) && p.images[0]) ||
            p.imageUrl ||
            p.img ||
            "";
        }
      }
    });

    return Array.from(map.entries()).map(([name, { imageUrl, count }]) => ({
      id:       name,                   // used as the key + filter value
      name,
      tagline:  `${count} ${count === 1 ? "piece" : "pieces"}`,
      imageUrl,
    }));
  }, [products]);

  /* ── Click: scroll to #menu and apply category filter via hash param ── */
  function handleCollectionClick(collection) {
    // Encode the category into the URL hash so MenuSection can read it later
    // (no router change — plain browser hash + custom event)
    const encoded = encodeURIComponent(collection.id);
    window.location.hash = `menu?category=${encoded}`;

    const el = document.getElementById("menu");
    if (el) {
      const offset = 80; // navbar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }

    // Dispatch a custom event so MenuSection can react without routing
    window.dispatchEvent(
      new CustomEvent("selara:filter-category", { detail: collection.id })
    );
  }

  /* ── Skeleton placeholders while products load ── */
  const skeletonCount = 4;

  return (
    <section
      id="collections"
      className="section-pad"
      style={{ background: C.cream, paddingTop: 72, paddingBottom: 80 }}
    >
      <div style={{ maxWidth: 1260, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Shop by Category"
          title={<>Explore the <em style={{ fontStyle: "italic" }}>Collections</em></>}
          sub="Each collection is crafted around a distinct mood — find yours and shop everything within it."
        />

        {/* ── Loading skeletons ── */}
        {loading && (
          <div style={gridStyle}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="img-placeholder reveal"
                style={{ borderRadius: 0, aspectRatio: "1 / 1.15" }}
              />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && collections.length === 0 && (
          <p style={{
            fontFamily: FONT_BODY, fontSize: 13, color: C.mist,
            textAlign: "center", padding: "48px 0",
          }}>
            No collections available yet.
          </p>
        )}

        {/* ── Collection cards grid ── */}
        {!loading && collections.length > 0 && (
          <div style={gridStyle}>
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                onClick={handleCollectionClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Responsive grid: 2 cols mobile → 3 → 4 ── */
const gridStyle = {
  display:               "grid",
  gridTemplateColumns:   "repeat(auto-fill, minmax(220px, 1fr))",
  gap:                   24,
};
