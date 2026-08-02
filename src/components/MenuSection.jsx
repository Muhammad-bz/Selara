import React, { useState, useCallback, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";
import SectionHeader from "./shared/SectionHeader";
import ProductCard from "./shared/ProductCard";

/* ═══════════════════════════════════════════════
   MENU SECTION
   • Featured products are shown in FeaturedSection above —
     this section displays only non-featured products so
     nothing is duplicated on the main screen.
   • All products are still reachable via category filter
     and search (featured badge is shown on the card when
     browsing by category).
   PERF: visible list is memoised — only recalculates
         when filter/sort state actually changes.
═══════════════════════════════════════════════ */
export default function MenuSection({ onAdd, wishlist, toggleWish, products, loading, error }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query,          setQuery]          = useState("");
  const [sort,           setSort]           = useState("default");
  const scrollRef = useRef(null);

  /* ── Non-featured products only ─────────────────
     Featured ones already appear in FeaturedSection.
     Category pills + search still work across this subset.
  ─────────────────────────────────────────────── */
  const nonFeatured = useMemo(
    () => products.filter((p) => !p.featured),
    [products]
  );

  const categories = useMemo(
    () => ["All", ...new Set(nonFeatured.map((p) => p.category).filter(Boolean))],
    [nonFeatured]
  );

  const visible = useMemo(() => {
    const lower = query.toLowerCase();
    return nonFeatured
      .filter((p) => {
        const matchCat    = activeCategory === "All" || p.category === activeCategory;
        const matchSearch = !query ||
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower);
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sort === "price-asc")  return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "alpha")      return a.name.localeCompare(b.name);
        return 0;
      });
  }, [nonFeatured, activeCategory, query, sort]);

  const handleCat = useCallback((cat) => {
    setActiveCategory(cat);
    setQuery("");
  }, []);

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
    setActiveCategory("All");
  }, []);

  const clearQuery = useCallback(() => setQuery(""), []);
  const clearAll   = useCallback(() => { setQuery(""); setActiveCategory("All"); }, []);

  /* ── Nothing to show (all products are featured) ── */
  const allFeatured = !loading && !error && products.length > 0 && nonFeatured.length === 0;

  return (
    <section id="menu" className="section-pad" style={{ background: C.creamDeep, paddingTop: 72, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1260, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="The Full Edit"
          title={<>Shop the <em style={{ fontStyle: "italic" }}>Collection</em></>}
          sub="Browse by category, search for a style, or simply explore — everything Selara has to offer."
        />

        {/* ── Search + Sort bar ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
            <input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={handleQueryChange}
              style={{
                width: "100%", padding: "11px 14px 11px 38px",
                background: C.cream, border: `1px solid ${C.line}`,
                borderRadius: 4, fontFamily: FONT_BODY, fontSize: 13,
                color: C.espresso, outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = C.rose; }}
              onBlur={(e)  => { e.target.style.borderColor = C.line; }}
            />
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={C.mist} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            {query && (
              <button
                onClick={clearQuery}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.mist, padding: 2,
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "11px 14px", background: C.cream,
              border: `1px solid ${C.line}`, borderRadius: 4,
              fontFamily: FONT_BODY, fontSize: 13, color: C.espresso,
              outline: "none", cursor: "pointer", flexShrink: 0,
              appearance: "none", paddingRight: 32,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6558' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="default">Default order</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="alpha">A → Z</option>
          </select>

          {!loading && !error && (
            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, flexShrink: 0 }}>
              {visible.length} item{visible.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Category pills ── */}
        {!allFeatured && (
          <div
            ref={scrollRef}
            style={{
              display: "flex", gap: 8, overflowX: "auto",
              paddingBottom: 16, marginBottom: 36,
              scrollbarWidth: "none", msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCat(cat)}
                  style={{
                    flexShrink: 0, padding: "8px 18px", borderRadius: 0,
                    border: active ? `1px solid ${C.rose}` : `1px solid ${C.line}`,
                    background: active ? C.rose : "transparent",
                    color: active ? "#fff" : C.mist,
                    fontFamily: FONT_BODY, fontSize: 11, fontWeight: active ? 500 : 400,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s, border-color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="img-placeholder"
                style={{ borderRadius: 4, height: 280 }}
              />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 300, color: C.mist }}>
              Unable to load menu.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginTop: 8 }}>
              {error}
            </p>
          </div>
        )}

        {/* ── No products at all ── */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 300, color: C.mist }}>
              No products available right now.
            </p>
          </div>
        )}

        {/* ── All products are featured (shown above) ── */}
        {allFeatured && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 300, color: C.mist }}>
              All current products are featured above.
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginTop: 8 }}>
              Check back soon for more additions to the collection.
            </p>
          </div>
        )}

        {/* ── No search results ── */}
        {!loading && !error && nonFeatured.length > 0 && visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.mist }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 300 }}>
              No results for &ldquo;{query}&rdquo;
            </p>
            <button
              onClick={clearAll}
              style={{
                marginTop: 16, background: "none", border: "none",
                cursor: "pointer", color: C.gold, fontFamily: FONT_BODY, fontSize: 13,
              }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── Product grid ── */}
        {!loading && !error && visible.length > 0 && (
          <div className="product-grid">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={onAdd}
                wishlist={wishlist}
                toggleWish={toggleWish}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
