// src/pages/admin/Settings.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Store,
  Globe,
  Clock,
  Layers,
  Instagram,
  Facebook,
  Music,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
  Youtube,
  Image as ImageIcon,
  Upload,
  Loader,
  DollarSign,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS  (mirrors AdminLayout exactly)
───────────────────────────────────────────────── */
const C = {
  cream:     "#FDF8F5",
  creamDeep: "#F7EEE9",
  parchment: "#EFE0D8",
  chocolate: "#C9818F",
  espresso:  "#1C1C1C",
  gold:      "#C9818F",
  goldLight: "#F2C4CE",
  caramel:   "#E8A0B0",
  mist:      "#9A8A8A",
  line:      "rgba(201,129,143,0.15)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'Jost', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────── */
const DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FIRESTORE_DOC = { collection: "settings", id: "site" };

/* Cloudinary config */
const CLOUDINARY_CLOUD_NAME    = "leu4dssl";
const CLOUDINARY_UPLOAD_PRESET = "cremeo";

/* Only the fields the client is allowed to edit */
const DEFAULTS = {
  /* Branding */
  storeName:     "Your Store",
  tagline:       "Quality Products · Online Store",
  logoUrl:       "",
  heroBannerUrl: "",
  aboutImageUrl: "",
  aboutText:     "",
  /* Contact */
  phone:         "",
  whatsapp:      "",
  email:         "",
  /* Social */
  instagram:     "",
  facebook:      "",
  tiktok:        "",
  youtube:       "",

};

function settingsEqual(a, b) {
  const norm = (o) => ({ ...o, closedDays: [...(o.closedDays ?? [])].sort() });
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/* ─────────────────────────────────────────────────
   CLOUDINARY UPLOAD HELPER
───────────────────────────────────────────────── */
async function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    );

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } catch {
          reject(new Error("Invalid response from Cloudinary."));
        }
      } else {
        reject(new Error(`Upload failed (HTTP ${xhr.status}).`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));
    xhr.send(formData);
  });
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function SettingsStyles() {
  return (
    <style>{`
      .set-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(201,129,143,0.06);
        animation: set-rise 0.38s ease both;
        transition: border-color 0.22s ease, box-shadow 0.22s ease;
      }
      .set-card:focus-within {
        border-color: rgba(201,168,76,0.32);
        box-shadow: 0 4px 22px rgba(201,129,143,0.10);
      }
      .set-card-header {
        padding: 18px 24px;
        border-bottom: 1px solid ${C.line};
        background: ${C.cream};
        display: flex;
        align-items: center;
        gap: 13px;
      }
      .set-card-icon {
        width: 36px; height: 36px;
        border-radius: 9px;
        background: rgba(201,129,143,0.11);
        border: 1px solid rgba(201,129,143,0.22);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .set-card-body { padding: 24px; }

      .set-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px 22px;
      }
      .set-col-full { grid-column: 1 / -1; }

      .set-field {
        display: flex; flex-direction: column;
        gap: 7px; min-width: 0;
      }
      .set-label {
        font-family: ${FONT_BODY};
        font-size: 10.5px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: ${C.mist};
        display: flex; align-items: center; gap: 5px;
      }

      .set-input {
        font-family: ${FONT_BODY}; font-size: 13.5px;
        color: ${C.espresso};
        background: ${C.cream};
        border: 1px solid ${C.line};
        border-radius: 8px;
        padding: 0 13px; height: 44px; width: 100%;
        box-sizing: border-box; outline: none;
        -webkit-appearance: none; appearance: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .set-input::placeholder { color: ${C.mist}; opacity: 0.45; }
      .set-input:hover  { border-color: rgba(201,129,143,0.38); background: #fff; }
      .set-input:focus  { border-color: #C9818F; box-shadow: 0 0 0 3px rgba(201,129,143,0.13); background: #fff; }
      .set-textarea { height: auto; padding: 11px 13px; resize: vertical; min-height: 72px; line-height: 1.55; }
      input[type="time"].set-input { cursor: pointer; }

      .set-days-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .set-day-pill {
        font-family: ${FONT_BODY}; font-size: 12.5px; font-weight: 500;
        padding: 0 15px; height: 38px; border-radius: 20px;
        border: 1.5px solid ${C.line};
        background: ${C.cream}; color: ${C.mist};
        cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        transition: border-color 0.16s, background 0.16s, color 0.16s, transform 0.1s;
        -webkit-tap-highlight-color: transparent; user-select: none;
      }
      .set-day-pill:hover { border-color: rgba(201,129,143,0.45); color: ${C.chocolate}; }
      .set-day-pill.active {
        background: rgba(201,129,143,0.14); border-color: #C9818F;
        color: ${C.chocolate}; font-weight: 600;
      }
      .set-day-pill:active { transform: scale(0.95); }
      .set-day-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9818F; flex-shrink: 0; }

      /* Image upload widget */
      .set-img-upload {
        border: 1.5px dashed ${C.line};
        border-radius: 10px;
        background: ${C.cream};
        padding: 16px;
        display: flex; align-items: center; gap: 14px;
        transition: border-color 0.18s, background 0.18s;
        min-height: 72px;
      }
      .set-img-upload:hover { border-color: rgba(201,129,143,0.45); background: #fff; }
      .set-img-upload-thumb {
        width: 52px; height: 52px; border-radius: 7px;
        object-fit: cover; flex-shrink: 0;
        border: 1px solid ${C.line};
        background: ${C.parchment};
      }
      .set-img-upload-btn {
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 600;
        color: ${C.chocolate}; background: rgba(201,129,143,0.13);
        border: 1px solid rgba(201,129,143,0.28);
        border-radius: 6px; padding: 7px 14px;
        cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        transition: background 0.16s, border-color 0.16s;
        white-space: nowrap;
      }
      .set-img-upload-btn:hover { background: rgba(201,129,143,0.22); border-color: #C9818F; }
      .set-img-upload-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      /* Sticky save bar */
      .set-save-bar {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
        display: flex; align-items: center; gap: 10px;
        padding: 12px 28px calc(12px + env(safe-area-inset-bottom, 0px));
        background: ${C.espresso};
        border-top: 1px solid rgba(201,129,143,0.18);
        box-shadow: 0 -6px 28px rgba(28,12,18,0.22);
        transform: translateY(100%);
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      .set-save-bar.visible { transform: translateY(0); }
      .set-bar-msg {
        flex: 1; font-family: ${FONT_BODY}; font-size: 12px;
        color: rgba(250,246,239,0.45); white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis; min-width: 0;
      }
      .set-save-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 0 22px; height: 42px;
        font-family: ${FONT_BODY}; font-size: 13px; font-weight: 700;
        letter-spacing: 0.01em; color: ${C.espresso};
        background: #1C1C1C; border: none; border-radius: 7px;
        cursor: pointer; white-space: nowrap; flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.18s, transform 0.12s;
      }
      .set-save-btn:hover  { background: #2d1820; }
      .set-save-btn:active { transform: scale(0.97); }
      .set-reset-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        padding: 0 16px; height: 42px;
        font-family: ${FONT_BODY}; font-size: 12.5px; font-weight: 500;
        color: rgba(250,246,239,0.5); background: transparent;
        border: 1px solid rgba(250,246,239,0.14); border-radius: 7px;
        cursor: pointer; white-space: nowrap; flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.18s, border-color 0.18s, background 0.18s;
      }
      .set-reset-btn:hover {
        color: rgba(250,246,239,0.82);
        border-color: rgba(250,246,239,0.28);
        background: rgba(250,246,239,0.05);
      }

      .set-toast {
        position: fixed; top: 72px; right: 20px; z-index: 400;
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; background: #fff;
        border: 1px solid rgba(34,139,70,0.22);
        border-left: 3px solid #2D7A4F; border-radius: 9px;
        box-shadow: 0 4px 22px rgba(201,129,143,0.08);
        font-family: ${FONT_BODY}; font-size: 13px; font-weight: 500;
        color: ${C.espresso}; max-width: 280px;
        transform: translateX(calc(100% + 32px));
        transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
      }
      .set-toast.visible { transform: translateX(0); pointer-events: auto; }
      .set-toast.error   { border-left-color: #C0392B; }
      .set-toast-dismiss {
        margin-left: auto; padding: 2px; background: none; border: none;
        cursor: pointer; color: ${C.mist}; opacity: 0.55;
        display: flex; align-items: center; flex-shrink: 0;
        transition: opacity 0.15s; -webkit-tap-highlight-color: transparent;
      }
      .set-toast-dismiss:hover { opacity: 1; }

      .set-loading-overlay {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 16px;
        font-family: ${FONT_BODY}; font-size: 13px; color: ${C.mist};
      }

      @keyframes set-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes set-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .set-spinner { animation: set-spin 0.8s linear infinite; }

      @media (max-width: 600px) {
        .set-grid       { grid-template-columns: 1fr; gap: 14px; }
        .set-col-full   { grid-column: 1; }
        .set-card-header { padding: 14px 16px; }
        .set-card-body   { padding: 16px; }
        .set-input { font-size: 16px; }
        .set-save-bar { padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); flex-wrap: wrap; gap: 8px; }
        .set-bar-msg   { width: 100%; flex: none; }
        .set-reset-btn { flex: 1; }
        .set-save-btn  { flex: 2; }
        .set-toast {
          top: auto; bottom: calc(76px + env(safe-area-inset-bottom, 0px));
          right: 12px; left: 12px; max-width: none;
          transform: translateY(16px); opacity: 0;
          transition: transform 0.26s ease, opacity 0.26s ease;
        }
        .set-toast.visible { transform: translateY(0); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .set-card, .set-save-bar, .set-toast, .set-input,
        .set-day-pill, .set-save-btn, .set-reset-btn {
          animation: none !important; transition: none !important;
        }
        .set-save-bar { transform: none; position: sticky; }
        .set-toast    { transform: none; opacity: 1; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────── */
function SectionCard({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <div className="set-card" style={{ animationDelay: `${delay}s` }}>
      <div className="set-card-header">
        <div className="set-card-icon">
          <Icon size={15} color="#C9818F" />
        </div>
        <div>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 400, fontStyle: "italic", color: C.espresso, lineHeight: 1.1, letterSpacing: "0.02em" }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.mist, marginTop: 3, opacity: 0.8 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="set-card-body">{children}</div>
    </div>
  );
}

function Field({ label, labelIcon: LIcon, children, full = false }) {
  return (
    <div className={`set-field${full ? " set-col-full" : ""}`}>
      <span className="set-label">
        {LIcon && <LIcon size={10} />}
        {label}
      </span>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="set-input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className="set-input set-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function ImageUpload({ label, value, onChange, hint, full = true }) {
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error,          setError]          = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const url = await uploadToCloudinary(file, (pct) => setUploadProgress(pct));
      onChange(url);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setError(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div className={`set-field${full ? " set-col-full" : ""}`}>
      <span className="set-label"><ImageIcon size={10} /> {label}</span>
      <div className="set-img-upload">
        {value ? (
          <img src={value} alt={label} className="set-img-upload-thumb" />
        ) : (
          <div className="set-img-upload-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={20} color={C.parchment} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            className="set-img-upload-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <><Loader size={12} className="set-spinner" /> Uploading {uploadProgress}%</>
              : <><Upload size={12} /> {value ? "Replace" : "Upload"}</>}
          </button>
          {value && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 5, wordBreak: "break-all", opacity: 0.65 }}>
              {value.split("/").pop()}
            </p>
          )}
          {hint && !value && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 4, opacity: 0.55 }}>
              {hint}
            </p>
          )}
          {error && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#C0392B", marginTop: 4 }}>{error}</p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mist, opacity: 0.45, padding: 4, flexShrink: 0 }}
            aria-label={`Remove ${label}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

function DayPills({ value, onChange }) {
  const toggle = useCallback(
    (day) => onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]),
    [value, onChange]
  );
  return (
    <div className="set-days-row">
      {DAYS.map((day, i) => {
        const active = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            className={`set-day-pill${active ? " active" : ""}`}
            onClick={() => toggle(day)}
            aria-pressed={active}
            aria-label={`${active ? "Unmark" : "Mark"} ${day} as closed`}
          >
            {active && <span className="set-day-dot" />}
            {DAY_ABR[i]}
          </button>
        );
      })}
    </div>
  );
}

function Toast({ visible, isError, message, onDismiss }) {
  return (
    <div
      className={`set-toast${visible ? " visible" : ""}${isError ? " error" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isError
        ? <X size={16} color="#C0392B" style={{ flexShrink: 0 }} />
        : <CheckCircle2 size={16} color="#22A84A" style={{ flexShrink: 0 }} />}
      <span>{message || "Settings saved"}</span>
      <button className="set-toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={13} />
      </button>
    </div>
  );
}

function SaveBar({ visible, saving, onSave, onReset }) {
  return (
    <div className={`set-save-bar${visible ? " visible" : ""}`} role="region" aria-label="Unsaved changes">
      <span className="set-bar-msg">You have unsaved changes</span>
      <button className="set-reset-btn" type="button" onClick={onReset} disabled={saving}>
        <RotateCcw size={12} />
        Reset
      </button>
      <button className="set-save-btn" type="button" onClick={onSave} disabled={saving}>
        {saving
          ? <><Loader size={12} className="set-spinner" /> Saving…</>
          : <><Save size={13} /> Save changes</>}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function Settings() {
  const [values,  setValues]  = useState({ ...DEFAULTS });
  const [saved,   setSaved]   = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState({ visible: false, message: "", isError: false });
  const toastTimer             = useRef(null);

  const isDirty = !settingsEqual(values, saved);

  /* ── Load from Firestore on mount — pick only allowed keys ── */
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id));
        if (snap.exists()) {
          const raw  = snap.data();
          const data = {};
          Object.keys(DEFAULTS).forEach((k) => {
            data[k] = raw[k] !== undefined ? raw[k] : DEFAULTS[k];
          });
          setValues(data);
          setSaved(data);
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = useCallback((message, isError = false) => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, isError });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3400);
  }, []);

  const field = useCallback(
    (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    []
  );
  const imageField = useCallback(
    (key) => (url) => setValues((v) => ({ ...v, [key]: url })),
    []
  );
  const setClosedDays = useCallback(
    (days) => setValues((v) => ({ ...v, closedDays: days })),
    []
  );

  /* ── Save only allowed fields to Firestore ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {};
      Object.keys(DEFAULTS).forEach((k) => { payload[k] = values[k]; });
      await setDoc(
        doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id),
        payload,
        { merge: true }
      );
      setSaved({ ...values });
      showToast("Settings saved successfully");
    } catch (err) {
      console.error("Settings save error:", err);
      showToast("Failed to save. Please try again.", true);
    } finally {
      setSaving(false);
    }
  }, [values, showToast]);

  const handleReset = useCallback(() => setValues({ ...saved }), [saved]);

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
    clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  if (loading) {
    return (
      <>
        <SettingsStyles />
        <div className="set-loading-overlay">
          <Loader size={18} color="#C9818F" className="set-spinner" />
          <span>Loading settings…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsStyles />
      <Toast
        visible={toast.visible}
        isError={toast.isError}
        message={toast.message}
        onDismiss={dismissToast}
      />
      <SaveBar visible={isDirty} saving={saving} onSave={handleSave} onReset={handleReset} />

      <div
        style={{
          fontFamily: FONT_BODY,
          paddingBottom: isDirty ? 82 : 0,
          transition: "padding-bottom 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400, fontStyle: "italic", color: C.espresso, marginBottom: 6, letterSpacing: "0.02em" }}>
            Settings
          </h1>
          <div style={{ width: 40, height: 1, background: "#C9818F", marginBottom: 26, opacity: 0.6 }} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.6 }}>
            Manage your store's business information. Changes are saved to Firestore and reflected on the live site.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── 1. Store Branding ── */}
          <SectionCard icon={Layers} title="Store Branding" subtitle="Name, tagline, logo and key images" delay={0}>
            <div className="set-grid">
              <Field label="Store Name">
                <Input value={values.storeName} onChange={field("storeName")} placeholder="e.g. Your Store" />
              </Field>

              <Field label="Tagline">
                <Input value={values.tagline} onChange={field("tagline")} placeholder="e.g. Quality Products · Online Store" />
              </Field>

              <ImageUpload
                label="Logo"
                value={values.logoUrl}
                onChange={imageField("logoUrl")}
                hint="Recommended: SVG or PNG with transparent background"
              />
              <ImageUpload
                label="Hero Banner"
                value={values.heroBannerUrl}
                onChange={imageField("heroBannerUrl")}
                hint="Recommended: 1600×900 JPG/WebP"
              />
              <ImageUpload
                label="About Image"
                value={values.aboutImageUrl}
                onChange={imageField("aboutImageUrl")}
                hint="Recommended: 900×600 JPG/WebP"
              />

              <Field label="About Text" full>
                <Textarea
                  value={values.aboutText}
                  onChange={field("aboutText")}
                  placeholder="Tell your brand story…"
                  rows={4}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 2. Contact ── */}
          <SectionCard icon={Phone} title="Contact" subtitle="How customers reach you" delay={0.04}>
            <div className="set-grid">
              <Field label="Phone Number" labelIcon={Phone}>
                <Input value={values.phone} onChange={field("phone")} placeholder="+92 300 0000000" type="tel" />
              </Field>

              <Field label="WhatsApp Number" labelIcon={MessageCircle}>
                <Input value={values.whatsapp} onChange={field("whatsapp")} placeholder="+92 300 0000000" type="tel" />
              </Field>

              <Field label="Email Address" labelIcon={Mail}>
                <Input value={values.email} onChange={field("email")} placeholder="hello@yourstore.com" type="email" />
              </Field>

              
            </div>
          </SectionCard>

          {/* ── 3. Social Media ── */}
          <SectionCard icon={Globe} title="Social Media" subtitle="Links shown in your storefront footer" delay={0.08}>
            <div className="set-grid">
              <Field label="Instagram" labelIcon={Instagram}>
                <Input value={values.instagram} onChange={field("instagram")} placeholder="https://instagram.com/yourstore" type="url" />
              </Field>

              <Field label="Facebook" labelIcon={Facebook}>
                <Input value={values.facebook} onChange={field("facebook")} placeholder="https://facebook.com/yourstore" type="url" />
              </Field>

              <Field label="TikTok" labelIcon={Music}>
                <Input value={values.tiktok} onChange={field("tiktok")} placeholder="https://tiktok.com/@yourstore" type="url" />
              </Field>

              <Field label="YouTube" labelIcon={Youtube}>
                <Input value={values.youtube} onChange={field("youtube")} placeholder="https://youtube.com/@yourstore" type="url" />
              </Field>
            </div>
          </SectionCard>

  
    </>
  );
}
