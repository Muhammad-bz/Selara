// src/components/CollectionsSection.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";
import SectionHeader from "./shared/SectionHeader";
import CollectionCard from "./shared/CollectionCard";

/* ═══════════════════════════════════════════════
   COLLECTIONS SECTION
   Derives one CollectionCard per unique product category
   from the live products array passed down from PublicPage.

   Category imageUrl and tagline are overlaid from
   localStorage (cremeo_categories) when present —
   the same store the admin Categories panel writes to.
═══════════════════════════════════════════════ */

const CAT_LS_KEY = "cremeo_categories";

/** Returns a Map of category name → { imageUrl, tagline } from localStorage. */
function loadCategoryMeta() {
  try {
    const raw = localStorage.getItem(CAT_LS_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Map();
    const map = new Map();
    parsed.forEach((c) => {
      if (c.name) {
        map.set(c.name.trim(), {
          imageUrl: c.imageUrl ?? "",
          tagline:  c.tagline  ?? "",
        });
      }
    });
    return map;
  } catch (_) {
    return new Map();
  }
}
export default function CollectionsSection({ products, loading }) {
  const navigate = useNavigate();

  /* ── Build one collection object per unique category ── */
  const collections = useMemo(() => {
    if (!products?.length) return [];

    const catMeta = loadCategoryMeta(); // imageUrl + tagline from admin
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

    return Array.from(map.entries()).map(([name, { imageUrl, count }]) => {
      const meta = catMeta.get(name) ?? {};
      return {
        id:      name,
        name,
        // Admin-set imageUrl wins; fall back to first product image
        imageUrl: meta.imageUrl || imageUrl,
        // Admin-set tagline wins; fall back to product count
        tagline:  meta.tagline  || `${count} ${count === 1 ? "piece" : "pieces"}`,
      };
    });
  }, [products]);

  /* ── Click: navigate to the collection detail page ── */
  function handleCollectionClick(collection) {
    const slug = encodeURIComponent(collection.id);
    navigate(`/collection/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
