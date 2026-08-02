import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, onSnapshot, query, where, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { fallbackImg, SITE_DEFAULTS } from "../constants/theme";

/* ═══════════════════════════════════════════════
   SCROLL REVEAL HOOK
   FIXED: Only runs once on mount and tears down properly.
   Uses a single long-lived IntersectionObserver with a
   MutationObserver to pick up newly-added .reveal nodes.
═══════════════════════════════════════════════ */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    const observe = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => io.observe(el));

    observe();

    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

/* ═══════════════════════════════════════════════
   FIRESTORE PRODUCTS HOOK
   - Fetches only available === true products
   - Sorts: featured first, then original order preserved
   - Spreads all doc fields so images[], mainImage, sizes
     are never silently dropped
═══════════════════════════════════════════════ */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "products"),
      where("available", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const raw = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            // Spread everything first so no Firestore field is ever silently dropped
            ...d,
            id:        docSnap.id,
            name:      d.name      ?? "",
            price:     d.price     ?? 0,
            category:  d.category  ?? "",
            desc:      d.desc      ?? d.description ?? "",
            tag:       d.tag       ?? "",
            featured:  d.featured  ?? false,
            available: d.available,
            order:     d.order     ?? 0,
            sizes:     d.sizes     ?? [],
            // Multi-image fields (set by the admin multi-image uploader)
            images:    Array.isArray(d.images) ? d.images : [],
            mainImage: d.mainImage ?? "",
            imageUrl:  d.imageUrl  ?? "",
            // img — normalised single image for ProductCard backwards compat
            img: d.mainImage
              || (Array.isArray(d.images) && d.images[0])
              || d.imageUrl
              || d.img
              || fallbackImg(d.category),
          };
        });

        const featured    = raw.filter((p) => p.featured);
        const nonFeatured = raw.filter((p) => !p.featured);

        setProducts([...featured, ...nonFeatured]);
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Failed to load products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}

/* ═══════════════════════════════════════════════
   SITE SETTINGS HOOK
   Reads from Firestore settings/site document.
   Falls back to hardcoded values for every field.
═══════════════════════════════════════════════ */
export function useSiteSettings() {
  const [settings, setSettings] = useState(SITE_DEFAULTS);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (!cancelled && snap.exists()) {
          setSettings({ ...SITE_DEFAULTS, ...snap.data() });
        }
      } catch (err) {
        console.warn("Could not load site settings, using defaults.", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  return { settings, loaded };
}

/* ═══════════════════════════════════════════════
   USE COLLECTION HOOK
   Derives a single collection object from the
   already-fetched products list, matched by slug
   (which equals the URL-encoded category name).

   Returns:
     { collection, products, loading, error }

   collection — null while loading or if not found
   products   — all available products in this category
                (same normalised shape as useProducts)
   loading    — true until Firestore snapshot arrives
   error      — Firestore error string or null

   This is a pure derivation hook — it calls
   useProducts() internally so the caller only needs
   one import.  useProducts itself is memoised by
   onSnapshot, so a second call on the same page
   reuses the same live listener.
═══════════════════════════════════════════════ */
export function useCollection(slug) {
  const { products, loading, error } = useProducts();

  const categoryName = slug ? decodeURIComponent(slug) : "";

  // Filter to this category's products (case-insensitive match)
  const categoryProducts = products.filter(
    (p) => p.category?.trim().toLowerCase() === categoryName.trim().toLowerCase()
  );

  // Resolve cover image: first real image found across category products
  const coverImage = categoryProducts
    .map(
      (p) =>
        p.mainImage ||
        (Array.isArray(p.images) && p.images[0]) ||
        p.imageUrl ||
        p.img ||
        ""
    )
    .find(Boolean) ?? "";

  // Only materialise the collection once products have loaded
  const collection =
    loading || !categoryName
      ? null
      : categoryProducts.length > 0
      ? {
          name:     categoryProducts[0].category.trim(),
          slug:     encodeURIComponent(categoryProducts[0].category.trim()),
          tagline:  `${categoryProducts.length} ${
            categoryProducts.length === 1 ? "piece" : "pieces"
          } in this collection`,
          imageUrl: coverImage,
          count:    categoryProducts.length,
        }
      : null; // category exists in slug but no products → treated as 404

  return { collection, products: categoryProducts, loading, error };
}