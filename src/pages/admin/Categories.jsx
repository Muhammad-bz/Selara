// src/pages/admin/Categories.jsx
// Rendered inside AdminLayout via <Outlet />.
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS  (mirrors AdminLayout palette)
───────────────────────────────────────────────── */
const C = {
  cream:        "#FDF8F5",
  creamDeep:    "#F7EEE9",
  parchment:    "#EFE0D8",
  // primary accent — rose/petal replaces chocolate/espresso for interactive elements
  chocolate:    "#C9818F",   // → rose (primary CTA, active states)
  espresso:     "#1C1C1C",   // → charcoal (headings, strong text)
  gold:         "#C9818F",   // → rose (accent rule under heading)
  goldLight:    "#F2C4CE",   // → blush (CTA text on dark bg)
  caramel:      "#E8A0B0",   // → petal (focus rings, hover accents)
  mist:         "#9A8A8A",   // same role
  line:         "rgba(201,129,143,0.15)",
  lineStrong:   "rgba(201,129,143,0.25)",
  danger:       "#B54A4A",
  dangerBg:     "rgba(181,74,74,0.07)",
  dangerBorder: "rgba(181,74,74,0.2)",
  successBg:    "rgba(45,122,79,0.08)",
  successLine:  "rgba(45,122,79,0.22)",
};

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'Jost', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   SEED DATA
───────────────────────────────────────────────── */
const LS_KEY  = "cremeo_categories";
const LS_ID   = "cremeo_categories_nextId";

const SEED = [
  { id: 1, name: "Category A", description: "First product category.", displayOrder: 1, active: true,  createdDate: "2024-03-01" },
  { id: 2, name: "Category B", description: "Second product category.", displayOrder: 2, active: true,  createdDate: "2024-03-05" },
  { id: 3, name: "Category C", description: "Third product category.",  displayOrder: 3, active: true,  createdDate: "2024-04-12" },
  { id: 4, name: "Category D", description: "Fourth product category.", displayOrder: 4, active: false, createdDate: "2024-06-20" },
];

function loadCategories() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return SEED;
}

function saveCategories(cats) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cats));
    // Dispatch a storage event so same-tab listeners (Products.jsx) pick up the change
    window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }));
  } catch (_) {}
}

function loadNextId() {
  try {
    const v = localStorage.getItem(LS_ID);
    if (v) return Number(v);
  } catch (_) {}
  return 5;
}

function saveNextId(id) {
  try { localStorage.setItem(LS_ID, String(id)); } catch (_) {}
}

let _nextId = loadNextId();

/* ─────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  @keyframes catFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes catShake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-4px); }
    40%,80% { transform: translateX(4px); }
  }
  @keyframes catSlideIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1);     }
  }
  @keyframes catToastIn {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0);    }
  }

  /* ── Table rows ── */
  .cat-row {
    animation: catFadeUp 0.22s ease both;
    transition: background 0.14s ease;
  }
  .cat-row:hover { background: ${C.cream} !important; }

  /* ── Mobile cards ── */
  .cat-card {
    animation: catFadeUp 0.22s ease both;
    background: #fff;
    border: 1px solid ${C.line};
    border-radius: 8px;
    padding: 14px 16px;
    transition: box-shadow 0.16s ease;
  }
  .cat-card:hover { box-shadow: 0 2px 8px rgba(92,51,23,0.09); }

  /* ── Buttons ── */
  .cat-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    background: #1C1C1C; color: ${C.goldLight};
    border: none; border-radius: 6px; cursor: pointer;
    font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600;
    letter-spacing: 0.03em;
    transition: background 0.18s ease, transform 0.12s ease;
    white-space: nowrap;
  }
  .cat-btn-primary:hover  { background: #2d1820; }
  .cat-btn-primary:active { transform: scale(0.97); }

  .cat-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 13px;
    background: transparent; color: ${C.mist};
    border: 1px solid ${C.line}; border-radius: 6px; cursor: pointer;
    font-family: ${FONT_BODY}; font-size: 12px; font-weight: 500;
    transition: border-color 0.16s, color 0.16s, background 0.16s;
    white-space: nowrap;
  }
  .cat-btn-ghost:hover { border-color: ${C.caramel}; color: ${C.chocolate}; background: ${C.creamDeep}; }

  .cat-icon-btn {
    background: none; border: none; cursor: pointer; border-radius: 6px;
    padding: 6px; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .cat-icon-btn.edit { color: ${C.mist}; }
  .cat-icon-btn.edit:hover { background: ${C.creamDeep}; color: ${C.chocolate}; }
  .cat-icon-btn.del  { color: ${C.mist}; }
  .cat-icon-btn.del:hover  { background: ${C.dangerBg}; color: ${C.danger}; }

  /* ── Search ── */
  .cat-search-wrap { position: relative; flex: 1; min-width: 0; }
  .cat-search-wrap svg.search-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    pointer-events: none; flex-shrink: 0;
  }
  .cat-search {
    width: 100%; box-sizing: border-box;
    padding: 9px 12px 9px 34px;
    border: 1px solid ${C.line}; border-radius: 6px;
    background: #fff;
    font-family: ${FONT_BODY}; font-size: 13px; color: ${C.espresso};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .cat-search::placeholder { color: ${C.mist}; opacity: 0.6; }
  .cat-search:focus { border-color: ${C.caramel}; box-shadow: 0 0 0 3px rgba(200,149,107,0.12); }

  /* ── Form inputs ── */
  .cat-input {
    width: 100%; box-sizing: border-box;
    padding: 9px 12px;
    border: 1px solid ${C.line}; border-radius: 6px;
    background: #fff;
    font-family: ${FONT_BODY}; font-size: 13px; color: ${C.espresso};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .cat-input::placeholder { color: ${C.mist}; opacity: 0.55; }
  .cat-input:focus { border-color: ${C.caramel}; box-shadow: 0 0 0 3px rgba(200,149,107,0.12); }
  .cat-input.error { border-color: ${C.danger}; box-shadow: 0 0 0 3px rgba(201,76,76,0.10); animation: catShake 0.35s ease; }

  /* ── Toggle ── */
  .cat-toggle { position: relative; width: 38px; height: 22px; display: inline-flex; cursor: pointer; flex-shrink: 0; }
  .cat-toggle input { opacity: 0; width: 0; height: 0; }
  .cat-toggle-track {
    position: absolute; inset: 0;
    background: ${C.parchment}; border: 1px solid ${C.lineStrong}; border-radius: 999px;
    transition: background 0.22s, border-color 0.22s;
  }
  .cat-toggle input:checked ~ .cat-toggle-track { background: ${C.chocolate}; border-color: ${C.chocolate}; }
  .cat-toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 14px; height: 14px; background: #fff; border-radius: 50%;
    transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .cat-toggle input:checked ~ .cat-toggle-thumb { transform: translateX(16px); }

  /* ── Modals ── */
  .cat-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(28,28,28,0.45); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 500; padding: 20px; box-sizing: border-box;
  }
  .cat-modal {
    background: #fff; border-radius: 10px;
    width: 100%; max-width: 480px;
    box-shadow: 0 20px 60px rgba(28,12,18,0.22);
    animation: catSlideIn 0.22s ease both; overflow: hidden;
  }
  .cat-confirm-modal {
    background: #fff; border-radius: 10px;
    width: 100%; max-width: 380px;
    box-shadow: 0 20px 60px rgba(28,12,18,0.22);
    animation: catSlideIn 0.22s ease both;
    padding: 28px; text-align: center;
  }

  /* ── Toast ── */
  .cat-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 600;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px;
    background: #1C1C1C; color: ${C.goldLight};
    border-radius: 8px;
    font-family: ${FONT_BODY}; font-size: 13px; font-weight: 500;
    box-shadow: 0 6px 20px rgba(28,12,18,0.28);
    animation: catToastIn 0.22s ease both;
    max-width: calc(100vw - 48px);
  }

  /* ── Sort button ── */
  .cat-sort-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    display: inline-flex; align-items: center; gap: 3px;
    font-family: ${FONT_BODY}; font-size: 11px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: ${C.mist}; opacity: 0.7;
    transition: color 0.15s, opacity 0.15s;
  }
  .cat-sort-btn:hover, .cat-sort-btn.active { color: ${C.chocolate}; opacity: 1; }

  /* ── Status badge ── */
  .cat-badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 999px;
    font-family: ${FONT_BODY}; font-size: 11px; font-weight: 600;
  }
  .cat-badge-on  { background: ${C.successBg}; color: #3A7A3A; border: 1px solid ${C.successLine}; }
  .cat-badge-off { background: ${C.dangerBg};  color: ${C.danger}; border: 1px solid ${C.dangerBorder}; }

  /* ── Layout switches ── */
  /* Desktop: show table, hide cards */
  .cat-table-view { display: block; }
  .cat-card-view  { display: none;  }

  /* Mobile ≤640px: hide table, show cards */
  @media (max-width: 640px) {
    .cat-table-view { display: none;  }
    .cat-card-view  { display: flex; flex-direction: column; gap: 10px; }
    .cat-toast { bottom: 16px; right: 16px; left: 16px; right: 16px; max-width: none; }
  }
`;

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = { name: "", description: "", tagline: "", imageUrl: "", displayOrder: "", active: true };

/* ─────────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="cat-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="cat-toggle-track" />
      <span className="cat-toggle-thumb" />
    </label>
  );
}

/* ─────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="cat-toast">
      <CheckCircle size={14} />
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────────── */
function ConfirmDialog({ category, onConfirm, onCancel }) {
  return (
    <div className="cat-modal-overlay" onClick={onCancel}>
      <div className="cat-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: C.dangerBg, border: `1px solid ${C.dangerBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertTriangle size={20} color={C.danger} />
        </div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, color: C.espresso, marginBottom: 8, fontStyle: "italic" }}>
          Delete Category?
        </h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.55, marginBottom: 24 }}>
          <strong style={{ color: C.chocolate }}>{category.name}</strong> will be permanently
          removed. Products assigned to this category may lose their classification.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="cat-btn-ghost" onClick={onCancel} style={{ minWidth: 88 }}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 18px", minWidth: 88,
              background: C.danger, color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer",
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#A63030"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.danger; }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CLOUDINARY IMAGE UPLOADER
   Reuses the project's unsigned upload preset.
   Renders a dropzone / click-to-upload UI consistent
   with the existing admin image upload pattern.
───────────────────────────────────────────────── */
const CLOUD_NAME    = "leu4dssl";
const UPLOAD_PRESET = "cremeo";

function CategoryImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadErr("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr("Image must be under 10 MB.");
      return;
    }
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);
      fd.append("folder", "categories");
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message ?? "Upload failed.");
      onChange(data.secure_url);
    } catch (err) {
      setUploadErr(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onFile = (e) => { upload(e.target.files[0]); e.target.value = ""; };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.chocolate, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
        COLLECTION IMAGE
      </label>

      {/* Preview */}
      {value && !uploading && (
        <div style={{ position: "relative", marginBottom: 8, display: "inline-block" }}>
          <img
            src={value}
            alt="Category preview"
            style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.line}`, display: "block" }}
          />
          <button
            onClick={() => onChange("")}
            title="Remove image"
            style={{
              position: "absolute", top: -7, right: -7,
              width: 20, height: 20, borderRadius: "50%",
              background: C.danger, border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0,
            }}
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragging ? C.chocolate : C.lineStrong}`,
          borderRadius: 6,
          padding: "14px 16px",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragging ? C.creamDeep : "transparent",
          transition: "border-color 0.18s, background 0.18s",
          userSelect: "none",
        }}
      >
        {uploading ? (
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>Uploading…</span>
        ) : (
          <>
            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.chocolate, fontWeight: 500 }}>
              {value ? "Replace image" : "Upload image"}
            </span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, display: "block", marginTop: 2 }}>
              Click or drag &amp; drop · JPG, PNG, WebP · max 10 MB
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFile}
      />

      {uploadErr && (
        <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.danger, marginTop: 4 }}>{uploadErr}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CATEGORY FORM MODAL
───────────────────────────────────────────────── */
function CategoryModal({ mode, initial, existingNames, onSave, onClose }) {
  const [form,   setForm]   = useState(initial);
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = "Name is required.";
    else if (
      existingNames
        .filter((n) => n !== initial.name)
        .map((n) => n.toLowerCase())
        .includes(form.name.trim().toLowerCase())
    )
      e.name = "A category with this name already exists.";
    if (form.displayOrder !== "" && (isNaN(Number(form.displayOrder)) || Number(form.displayOrder) < 0))
      e.displayOrder = "Display order must be a positive number.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      name:         form.name.trim(),
      description:  form.description.trim(),
      tagline:      (form.tagline ?? "").trim(),
      imageUrl:     form.imageUrl ?? "",
      displayOrder: form.displayOrder === "" ? 0 : Number(form.displayOrder),
    });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") handleSave();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="cat-modal-overlay" onClick={onClose}>
      <div
        className="cat-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
        style={{ maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 18px", borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 400, fontStyle: "italic", color: C.espresso, margin: 0, letterSpacing: "0.02em" }}>
              {mode === "add" ? "New Category" : "Edit Category"}
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginTop: 2 }}>
              {mode === "add" ? "Add a new product category." : "Update category details."}
            </p>
          </div>
          <button className="cat-icon-btn edit" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

          {/* Name */}
          <div>
            <label style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.chocolate, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
              NAME <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              ref={nameRef}
              className={`cat-input${errors.name ? " error" : ""}`}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Summer Dresses"
              maxLength={80}
            />
            {errors.name && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.danger, marginTop: 4 }}>{errors.name}</p>
            )}
          </div>

          {/* Tagline */}
          <div>
            <label style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.chocolate, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
              TAGLINE
            </label>
            <input
              className="cat-input"
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="e.g. Light, breezy pieces for warm days"
              maxLength={120}
            />
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginTop: 4 }}>
              Short line shown on the collection card and hero banner.
            </p>
          </div>

          {/* Collection Image */}
          <CategoryImageUpload
            value={form.imageUrl ?? ""}
            onChange={(url) => set("imageUrl", url)}
          />

          {/* Description */}
          <div>
            <label style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.chocolate, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
              DESCRIPTION
            </label>
            <textarea
              className="cat-input"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Internal description or admin notes…"
              rows={3}
              maxLength={300}
              style={{ resize: "vertical", lineHeight: 1.55, minHeight: 72 }}
            />
          </div>

          {/* Display Order + Active */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.chocolate, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
                DISPLAY ORDER
              </label>
              <input
                className={`cat-input${errors.displayOrder ? " error" : ""}`}
                type="number" min="0"
                value={form.displayOrder}
                onChange={(e) => set("displayOrder", e.target.value)}
                placeholder="0"
                style={{ maxWidth: 100 }}
              />
              {errors.displayOrder && (
                <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.danger, marginTop: 4 }}>{errors.displayOrder}</p>
              )}
            </div>
            <div style={{ paddingTop: 22, display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle checked={form.active} onChange={(v) => set("active", v)} />
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: form.active ? C.chocolate : C.mist }}>
                {form.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          padding: "16px 24px", borderTop: `1px solid ${C.line}`, background: C.cream,
          flexShrink: 0,
        }}>
          <button className="cat-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="cat-btn-primary" onClick={handleSave}>
            {mode === "add" ? <><Plus size={13} /> Add Category</> : <><CheckCircle size={13} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────── */
function EmptyState({ hasSearch, onAdd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 32px", textAlign: "center" }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: C.creamDeep, border: `1.5px solid ${C.parchment}`,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <Tag size={24} color="#C9818F" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, fontStyle: "italic", color: C.espresso, marginBottom: 6 }}>
        {hasSearch ? "No matching categories" : "No categories yet"}
      </h3>
      <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, maxWidth: 280, lineHeight: 1.6, marginBottom: 24 }}>
        {hasSearch
          ? "Try a different search term, or clear the search to see all categories."
          : "Categories help organise your products. Create your first one to get started."}
      </p>
      {!hasSearch && (
        <button className="cat-btn-primary" onClick={onAdd}>
          <Plus size={13} /> Add Category
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SORT HEADER
───────────────────────────────────────────────── */
function SortHeader({ label, field, sort, onSort, style }) {
  const active    = sort.field === field;
  const direction = active ? sort.dir : null;
  return (
    <th style={{
      ...style,
      textAlign: "left", padding: "10px 12px",
      background: C.creamDeep, borderBottom: `1px solid ${C.line}`,
    }}>
      <button className={`cat-sort-btn${active ? " active" : ""}`} onClick={() => onSort(field)}>
        {label}
        <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 0.6 }}>
          <ChevronUp   size={9} color={active && direction === "asc"  ? C.chocolate : C.mist} />
          <ChevronDown size={9} color={active && direction === "desc" ? C.chocolate : C.mist} />
        </span>
      </button>
    </th>
  );
}

/* ─────────────────────────────────────────────────
   MOBILE CARD ROW
───────────────────────────────────────────────── */
function MobileCard({ cat, idx, onEdit, onDelete, onToggle }) {
  return (
    <div className="cat-card" style={{ animationDelay: `${idx * 35}ms` }}>
      {/* Top row: thumbnail + name + actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        {/* Thumbnail */}
        {cat.imageUrl ? (
          <img
            src={cat.imageUrl}
            alt={cat.name}
            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.line}`, flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 4,
            background: C.creamDeep, border: `1px solid ${C.line}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Tag size={16} color={C.parchment} />
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: C.espresso, marginBottom: 2 }}>
            {cat.name}
          </div>
          {cat.tagline && (
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.chocolate, marginBottom: 2, fontStyle: "italic" }}>
              {cat.tagline}
            </div>
          )}
          {cat.description && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: 12, color: C.mist, lineHeight: 1.45,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {cat.description}
            </div>
          )}
        </div>
        {/* Action buttons */}
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <button className="cat-icon-btn edit" aria-label={`Edit ${cat.name}`} onClick={() => onEdit(cat)}>
            <Pencil size={14} />
          </button>
          <button className="cat-icon-btn del" aria-label={`Delete ${cat.name}`} onClick={() => onDelete(cat)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Bottom row: meta + toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Order badge */}
          <div style={{
            fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: C.mist,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 24, height: 24, borderRadius: 5,
            background: C.creamDeep, border: `1px solid ${C.line}`,
          }}>
            {cat.displayOrder}
          </div>
          {/* Status badge */}
          <span className={`cat-badge ${cat.active ? "cat-badge-on" : "cat-badge-off"}`}>
            {cat.active ? "Active" : "Inactive"}
          </span>
          {/* Date */}
          <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, opacity: 0.7 }}>
            {fmtDate(cat.createdDate)}
          </span>
        </div>
        {/* Toggle */}
        <Toggle checked={cat.active} onChange={(v) => onToggle(cat.id, v)} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────── */
export default function Categories() {
  const [categories, setCategories] = useState(() => loadCategories());
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState({ field: "displayOrder", dir: "asc" });
  const [modal,      setModal]      = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast,      setToast]      = useState(null);

  /* ── Derived list ── */
  const q = search.trim().toLowerCase();

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q) ||
      (c.tagline ?? "").toLowerCase().includes(q)
  );

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sort.field];
    let bv = b[sort.field];
    if (sort.field === "active") { av = av ? 1 : 0; bv = bv ? 1 : 0; }
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ?  1 : -1;
    return 0;
  });

  const existingNames = categories.map((c) => c.name);

  /* ── Handlers ── */
  const handleSort = (field) =>
    setSort((s) => s.field === field
      ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
      : { field, dir: "asc" }
    );

  const openAdd  = () => setModal({ mode: "add",  category: { ...EMPTY_FORM, displayOrder: categories.length + 1 } });
  const openEdit = (cat) => setModal({ mode: "edit", category: {
    ...cat,
    tagline:      cat.tagline      ?? "",
    imageUrl:     cat.imageUrl     ?? "",
    displayOrder: String(cat.displayOrder),
  } });

  const handleSave = (form) => {
    if (modal.mode === "add") {
      const newId = _nextId++;
      saveNextId(_nextId);
      setCategories((prev) => {
        const next = [...prev, { ...form, id: newId, createdDate: today() }];
        saveCategories(next);
        return next;
      });
      showToast(`"${form.name}" added.`);
    } else {
      setCategories((prev) => {
        const next = prev.map((c) => c.id === modal.category.id ? { ...c, ...form } : c);
        saveCategories(next);
        return next;
      });
      showToast(`"${form.name}" updated.`);
    }
    setModal(null);
  };

  const handleToggleActive = (id, val) =>
    setCategories((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, active: val } : c);
      saveCategories(next);
      return next;
    });

  const handleDelete = () => {
    const name = confirmDel.name;
    const delId = confirmDel.id;
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== delId);
      saveCategories(next);
      return next;
    });
    setConfirmDel(null);
    showToast(`"${name}" deleted.`);
  };

  const showToast = useCallback((msg) => setToast(msg), []);

  /* ── Stats ── */
  const totalActive   = categories.filter((c) => c.active).length;
  const totalInactive = categories.length - totalActive;

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400, fontStyle: "italic", color: C.espresso, margin: 0, lineHeight: 1.1, letterSpacing: "0.02em" }}>
              Categories
            </h1>
            <div style={{ width: 40, height: 1, background: "#C9818F", margin: "8px 0 10px", opacity: 0.6 }} />
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, margin: 0 }}>
              Organise your product catalogue by category.
            </p>
          </div>
          <button className="cat-btn-primary" onClick={openAdd}>
            <Plus size={14} /> Add Category
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          {[
            { label: "Total",    val: categories.length, accent: C.chocolate },
            { label: "Active",   val: totalActive,       accent: "#3A7A3A"   },
            { label: "Inactive", val: totalInactive,     accent: C.danger    },
          ].map(({ label, val, accent }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", background: "#fff",
              border: `1px solid ${C.line}`, borderRadius: 6,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: accent, lineHeight: 1 }}>{val}</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="cat-search-wrap">
          <Search size={13} color={C.mist} className="search-icon" />
          <input
            className="cat-search"
            placeholder="Search by name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button className="cat-btn-ghost" onClick={() => setSearch("")}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP TABLE VIEW  (>640px)
      ════════════════════════════════════════════ */}
      <div className="cat-table-view">
        <div style={{
          background: "#fff", border: `1px solid ${C.line}`,
          borderRadius: 8, overflow: "hidden",
          boxShadow: "0 1px 4px rgba(92,51,23,0.06)",
        }}>
          {sorted.length === 0 ? (
            <EmptyState hasSearch={q.length > 0} onAdd={openAdd} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
                  <colgroup>
                    <col style={{ width: 32 }} />
                    <col style={{ width: 52 }} />
                    <col style={{ width: "20%" }} />
                    <col />
                    <col style={{ width: 76 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 80 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px 6px 10px 12px", background: C.creamDeep, borderBottom: `1px solid ${C.line}` }} />
                      {/* Image — unsortable */}
                      <th style={{ padding: "10px 8px", background: C.creamDeep, borderBottom: `1px solid ${C.line}` }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mist, opacity: 0.7 }}>
                          Image
                        </span>
                      </th>
                      <SortHeader label="Name"        field="name"         sort={sort} onSort={handleSort} />
                      <SortHeader label="Tagline"     field="tagline"      sort={sort} onSort={handleSort} />
                      <SortHeader label="Order"       field="displayOrder" sort={sort} onSort={handleSort} />
                      <SortHeader label="Status"      field="active"       sort={sort} onSort={handleSort} />
                      <SortHeader label="Created"     field="createdDate"  sort={sort} onSort={handleSort} />
                      <th style={{ padding: "10px 12px 10px 4px", background: C.creamDeep, borderBottom: `1px solid ${C.line}`, textAlign: "right" }}>
                        <span style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mist, opacity: 0.7 }}>
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((cat, idx) => (
                      <tr
                        key={cat.id}
                        className="cat-row"
                        style={{
                          borderBottom: idx < sorted.length - 1 ? `1px solid ${C.line}` : "none",
                          background: "#fff",
                          animationDelay: `${idx * 35}ms`,
                        }}
                      >
                        {/* Grip */}
                        <td style={{ padding: "10px 4px 10px 12px", color: C.parchment, verticalAlign: "middle" }}>
                          <GripVertical size={13} />
                        </td>
                        {/* Image thumbnail */}
                        <td style={{ padding: "10px 8px", verticalAlign: "middle" }}>
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 3, border: `1px solid ${C.line}`, display: "block" }}
                            />
                          ) : (
                            <div style={{
                              width: 36, height: 36, borderRadius: 3,
                              background: C.creamDeep, border: `1px solid ${C.line}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Tag size={13} color={C.parchment} />
                            </div>
                          )}
                        </td>
                        {/* Name */}
                        <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: C.espresso }}>
                            {cat.name}
                          </div>
                        </td>
                        {/* Tagline */}
                        <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                          <div style={{
                            fontFamily: FONT_BODY, fontSize: 12, color: C.mist, fontStyle: cat.tagline ? "italic" : "normal",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {cat.tagline || <span style={{ opacity: 0.35 }}>—</span>}
                          </div>
                        </td>
                        {/* Order */}
                        <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                          <div style={{
                            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.mist,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: 6,
                            background: C.creamDeep, border: `1px solid ${C.line}`,
                          }}>
                            {cat.displayOrder}
                          </div>
                        </td>
                        {/* Status toggle */}
                        <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                          <Toggle checked={cat.active} onChange={(v) => handleToggleActive(cat.id, v)} />
                        </td>
                        {/* Created */}
                        <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                          <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>
                            {fmtDate(cat.createdDate)}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "10px 12px 10px 4px", verticalAlign: "middle", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <button className="cat-icon-btn edit" aria-label={`Edit ${cat.name}`} onClick={() => openEdit(cat)}>
                              <Pencil size={13} />
                            </button>
                            <button className="cat-icon-btn del" aria-label={`Delete ${cat.name}`} onClick={() => setConfirmDel(cat)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Table footer */}
              <div style={{
                padding: "10px 16px", borderTop: `1px solid ${C.line}`, background: C.cream,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist }}>
                  {sorted.length === categories.length
                    ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`
                    : `${sorted.length} of ${categories.length} categories`}
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, opacity: 0.45 }}>
                  Click column headers to sort
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE CARD VIEW  (≤640px)
      ════════════════════════════════════════════ */}
      <div className="cat-card-view">
        {sorted.length === 0 ? (
          <div style={{
            background: "#fff", border: `1px solid ${C.line}`,
            borderRadius: 8, overflow: "hidden",
          }}>
            <EmptyState hasSearch={q.length > 0} onAdd={openAdd} />
          </div>
        ) : (
          <>
            {sorted.map((cat, idx) => (
              <MobileCard
                key={cat.id}
                cat={cat}
                idx={idx}
                onEdit={openEdit}
                onDelete={setConfirmDel}
                onToggle={handleToggleActive}
              />
            ))}
            {/* Footer count */}
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, textAlign: "center", opacity: 0.55, margin: "4px 0 0" }}>
              {sorted.length === categories.length
                ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`
                : `${sorted.length} of ${categories.length} categories`}
            </p>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.category}
          existingNames={existingNames}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          category={confirmDel}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
