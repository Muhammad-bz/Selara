// src/pages/admin/Orders.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Banknote,
  Search,
  ChevronDown,
  X,
  PackageOpen,
  Eye,
  RefreshCw,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Hash,
  User,
  ChevronRight,
} from "lucide-react";

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
   STATUS CONFIG
───────────────────────────────────────────────── */
const STATUS = {
  pending: {
    label: "Pending",
    color: "#92670A",
    bg:    "rgba(201,129,143,0.13)",
    border:"rgba(201,129,143,0.35)",
    dot:   "#C9818F",
  },
  confirmed: {
    label: "Confirmed",
    color: "#1A5276",
    bg:    "rgba(26,82,118,0.10)",
    border:"rgba(26,82,118,0.28)",
    dot:   "#2E86C1",
  },
  preparing: {
    label: "Preparing",
    color: "#7C4A1E",
    bg:    "rgba(200,149,107,0.14)",
    border:"rgba(200,149,107,0.38)",
    dot:   C.caramel,
  },
  ready: {
    label: "Ready",
    color: "#6E2FA0",
    bg:    "rgba(110,47,160,0.10)",
    border:"rgba(110,47,160,0.28)",
    dot:   "#8E44AD",
  },
  delivered: {
    label: "Delivered",
    color: "#1E5C32",
    bg:    "rgba(34,139,70,0.10)",
    border:"rgba(34,139,70,0.28)",
    dot:   "#22A84A",
  },
  cancelled: {
    label: "Cancelled",
    color: "#8B2020",
    bg:    "rgba(183,28,28,0.08)",
    border:"rgba(183,28,28,0.22)",
    dot:   "#C0392B",
  },
};

const ALL_STATUSES      = ["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
const CHANGEABLE_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

/* ─────────────────────────────────────────────────
   FIRESTORE ORDERS HOOK
───────────────────────────────────────────────── */
function useOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data    = d.data();
          const ts      = data.createdAt;
          const dateObj = ts instanceof Timestamp
            ? ts.toDate()
            : (ts?.seconds ? new Date(ts.seconds * 1000) : null);

          const dateStr = dateObj ? dateObj.toISOString().slice(0, 10) : "—";
          const timeStr = dateObj
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—";

          const rawItems = Array.isArray(data.items) ? data.items : [];
          const itemNames = rawItems.map((i) =>
            typeof i === "string" ? i : `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`
          );

          return {
            id:       d.id,
            customer: data.customerName ?? data.customer ?? "—",
            phone:    data.phone        ?? "",
            address:  data.address      ?? "",
            notes:    data.notes        ?? "",
            items:    itemNames,
            rawItems,
            total:    data.total        ?? 0,
            status:   (data.status ?? "pending").toLowerCase(),
            date:     dateStr,
            time:     timeStr,
          };
        });
        setOrders(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Orders listener error:", err);
        setError(err.message ?? "Failed to load orders.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { orders, loading, error };
}

/* ─────────────────────────────────────────────────
   DERIVED STATS
───────────────────────────────────────────────── */
function deriveStats(orders) {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.date === today);
  return {
    todayCount: todayOrders.length,
    pending:    orders.filter((o) => o.status === "pending").length,
    delivered:  orders.filter((o) => o.status === "delivered").length,
    revenue:    todayOrders.reduce((s, o) => s + o.total, 0),
  };
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function OrdersStyles() {
  return (
    <style>{`
      /* ── Stat cards ───────────────────────────── */
      .ord-stat-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        padding: 20px 22px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        flex: 1 1 160px;
        min-width: 0;
        animation: ord-rise 0.38s ease both;
        box-shadow: 0 1px 3px rgba(201,129,143,0.06);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      }
      .ord-stat-card:hover {
        box-shadow: 0 4px 16px rgba(201,129,143,0.10);
        transform: translateY(-1px);
      }

      /* ── Toolbar ──────────────────────────────── */
      .ord-toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      /* ── Search ───────────────────────────────── */
      .ord-search-wrap {
        position: relative;
        flex: 1 1 220px;
        min-width: 0;
      }
      .ord-search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 9px 36px 9px 36px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        color: ${C.espresso};
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 7px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .ord-search-input::placeholder { color: ${C.mist}; opacity: 0.65; }
      .ord-search-input:focus {
        border-color: #C9818F;
        box-shadow: 0 0 0 3px rgba(201,129,143,0.12);
      }
      .ord-search-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: ${C.mist};
        opacity: 0.55;
        pointer-events: none;
        display: flex;
        align-items: center;
      }
      .ord-search-clear {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: ${C.mist};
        padding: 3px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        opacity: 0.55;
        transition: opacity 0.15s;
        line-height: 0;
      }
      .ord-search-clear:hover { opacity: 1; }

      /* ── Filter select ────────────────────────── */
      .ord-filter-wrap {
        position: relative;
        flex-shrink: 0;
      }
      .ord-filter-select {
        appearance: none;
        -webkit-appearance: none;
        padding: 9px 32px 9px 12px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 500;
        color: ${C.espresso};
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 7px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        min-width: 140px;
      }
      .ord-filter-select:focus {
        border-color: #C9818F;
        box-shadow: 0 0 0 3px rgba(201,129,143,0.12);
      }
      .ord-filter-chevron {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: ${C.mist};
        opacity: 0.6;
        display: flex;
        align-items: center;
      }

      /* ── Table card ───────────────────────────── */
      .ord-table-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(201,129,143,0.06);
        animation: ord-rise 0.42s ease both;
        animation-delay: 0.08s;
      }

      /* ── Table ────────────────────────────────── */
      .ord-table {
        width: 100%;
        border-collapse: collapse;
        font-family: ${FONT_BODY};
        font-size: 13px;
      }
      .ord-table thead tr {
        border-bottom: 1px solid ${C.line};
      }
      .ord-table th {
        padding: 11px 14px;
        text-align: left;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${C.mist};
        white-space: nowrap;
        background: ${C.cream};
      }
      .ord-table td {
        padding: 12px 14px;
        vertical-align: middle;
        color: ${C.espresso};
        border-bottom: 1px solid rgba(201,129,143,0.07);
      }
      .ord-table tbody tr {
        animation: ord-row-in 0.3s ease both;
        transition: background 0.15s ease;
        cursor: pointer;
      }
      .ord-table tbody tr:hover { background: ${C.cream}; }
      .ord-table tbody tr:last-child td { border-bottom: none; }

      /* ── Mobile: card rows ────────────────────── */
      .ord-mobile-cards { display: none; }
      .ord-mobile-card {
        padding: 16px;
        border-bottom: 1px solid rgba(201,129,143,0.08);
        animation: ord-row-in 0.3s ease both;
        transition: background 0.15s;
        cursor: pointer;
      }
      .ord-mobile-card:last-child { border-bottom: none; }
      .ord-mobile-card:hover { background: ${C.cream}; }

      /* ── Action button ────────────────────────── */
      .ord-view-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        font-family: ${FONT_BODY};
        font-size: 11.5px;
        font-weight: 500;
        color: ${C.chocolate};
        background: rgba(201,129,143,0.10);
        border: 1px solid rgba(201,129,143,0.28);
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        white-space: nowrap;
      }
      .ord-view-btn:hover {
        background: rgba(201,129,143,0.20);
        border-color: #C9818F;
      }

      /* ── Modal overlay ────────────────────────── */
      .ord-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(28,28,28,0.45);
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(2px);
        animation: ord-fade-in 0.2s ease;
      }
      .ord-modal {
        background: #fff;
        border-radius: 14px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 24px 64px rgba(28,12,18,0.22);
        animation: ord-modal-in 0.28s cubic-bezier(0.34,1.4,0.64,1);
        position: relative;
      }
      .ord-modal-header {
        padding: 22px 24px 18px;
        border-bottom: 1px solid ${C.line};
        background: ${C.cream};
        border-radius: 14px 14px 0 0;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .ord-modal-body {
        padding: 24px;
      }
      .ord-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        color: ${C.mist};
        display: flex;
        align-items: center;
        transition: background 0.15s, color 0.15s;
      }
      .ord-modal-close:hover {
        background: ${C.parchment};
        color: ${C.espresso};
      }

      /* ── Modal detail rows ────────────────────── */
      .ord-detail-row {
        display: flex;
        gap: 10px;
        padding: 11px 0;
        border-bottom: 1px solid rgba(201,129,143,0.08);
        align-items: flex-start;
      }
      .ord-detail-row:last-child { border-bottom: none; }
      .ord-detail-icon {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        background: rgba(201,129,143,0.10);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .ord-detail-label {
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: ${C.mist};
        margin-bottom: 3px;
      }
      .ord-detail-value {
        font-family: ${FONT_BODY};
        font-size: 13.5px;
        color: ${C.espresso};
        line-height: 1.5;
      }

      /* ── Items table in modal ─────────────────── */
      .ord-items-table {
        width: 100%;
        border-collapse: collapse;
        font-family: ${FONT_BODY};
        font-size: 13px;
        margin-top: 2px;
      }
      .ord-items-table th {
        text-align: left;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${C.mist};
        padding: 0 0 8px 0;
        border-bottom: 1px solid ${C.line};
      }
      .ord-items-table th:last-child { text-align: right; }
      .ord-items-table td {
        padding: 9px 0;
        border-bottom: 1px solid rgba(201,129,143,0.07);
        color: ${C.espresso};
        vertical-align: middle;
      }
      .ord-items-table td:last-child {
        text-align: right;
        font-weight: 600;
        white-space: nowrap;
      }
      .ord-items-table tr:last-child td { border-bottom: none; }

      /* ── Status change selector ───────────────── */
      .ord-status-select {
        appearance: none;
        -webkit-appearance: none;
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        padding: 9px 34px 9px 12px;
        border: 1.5px solid;
        cursor: pointer;
        outline: none;
        transition: box-shadow 0.18s;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239A8A8A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        width: 100%;
      }
      .ord-status-select:focus {
        box-shadow: 0 0 0 3px rgba(201,129,143,0.16);
      }
      .ord-status-saving {
        font-family: ${FONT_BODY};
        font-size: 12px;
        color: ${C.mist};
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }

      /* ── Animations ───────────────────────────── */
      @keyframes ord-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes ord-row-in {
        from { opacity: 0; transform: translateX(-4px); }
        to   { opacity: 1; transform: translateX(0);    }
      }
      @keyframes ord-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes ord-modal-in {
        from { opacity: 0; transform: scale(0.95) translateY(12px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes ord-spin {
        to { transform: rotate(360deg); }
      }

      /* ── Responsive breakpoint ────────────────── */
      @media (max-width: 768px) {
        .ord-stats-row   { gap: 10px !important; }
        .ord-stat-card   { flex: 1 1 calc(50% - 5px); padding: 16px 14px; }
        .ord-toolbar     { gap: 8px; }
        .ord-filter-wrap { width: 100%; }
        .ord-filter-select { width: 100%; min-width: 0; }
        .ord-table-head  { display: none; }
        .ord-table-body  { display: none; }
        .ord-mobile-cards { display: block; }
        .ord-modal { border-radius: 12px 12px 0 0; max-height: 92vh; }
        .ord-modal-overlay { align-items: flex-end; padding: 0; }
        .ord-modal-body { padding: 18px; }
        .ord-modal-header { padding: 18px 18px 14px; }
      }
      @media (max-width: 420px) {
        .ord-stat-card { flex: 1 1 100%; }
      }

      /* ── Reduced motion ───────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .ord-stat-card,
        .ord-table-card,
        .ord-modal,
        .ord-modal-overlay,
        .ord-table tbody tr,
        .ord-mobile-card { animation: none !important; }
        .ord-stat-card:hover { transform: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, delay = 0 }) {
  return (
    <div className="ord-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div style={{
        width: 38, height: 38,
        borderRadius: 9,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: FONT_BODY,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: C.mist,
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 28,
          fontWeight: 400,
          color: C.espresso,
          lineHeight: 1,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 9px 3px 7px",
      borderRadius: 20,
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontFamily: FONT_BODY,
      fontSize: 11.5,
      fontWeight: 600,
      color: s.color,
      whiteSpace: "nowrap",
      letterSpacing: "0.01em",
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: "50%",
        background: s.dot,
        flexShrink: 0,
      }} />
      {s.label}
    </span>
  );
}

function ItemsList({ items }) {
  const first = items[0] ?? "—";
  const rest  = items.length - 1;
  return (
    <span style={{ color: C.espresso }}>
      {first}
      {rest > 0 && (
        <span style={{
          marginLeft: 6,
          fontSize: 11,
          color: C.mist,
          fontWeight: 600,
          background: C.creamDeep,
          padding: "1px 6px",
          borderRadius: 10,
        }}>
          +{rest}
        </span>
      )}
    </span>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      textAlign: "center",
      animation: "ord-rise 0.36s ease",
    }}>
      <div style={{
        width: 56, height: 56,
        borderRadius: 14,
        background: C.creamDeep,
        border: `1.5px solid ${C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <PackageOpen size={24} color={C.mist} opacity={0.7} />
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 22,
        fontWeight: 400,
        fontStyle: "italic",
        color: C.espresso,
        marginBottom: 8,
      }}>
        {hasFilters ? "No orders match" : "No orders yet"}
      </p>
      <p style={{
        fontFamily: FONT_BODY,
        fontSize: 13,
        color: C.mist,
        maxWidth: 300,
        lineHeight: 1.6,
      }}>
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Orders placed by customers will appear here once they start coming in."}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ORDER DETAIL MODAL
───────────────────────────────────────────────── */
function OrderModal({ order, onClose }) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (newStatus === localStatus) return;
    setLocalStatus(newStatus);
    setSaving(true);
    setSaveMsg("");
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      setSaveMsg("Status updated");
    } catch (err) {
      console.error("Status update failed:", err);
      setSaveMsg("Failed to save — try again.");
      setLocalStatus(order.status); // revert
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2200);
    }
  }, [localStatus, order.id, order.status]);

  // Resolve raw items for display
  const displayItems = useMemo(() => {
    if (!order.rawItems?.length) return [];
    return order.rawItems.map((item) => {
      if (typeof item === "string") return { name: item, qty: 1, price: null };
      return {
        name:  item.name  ?? item.title ?? "Item",
        qty:   item.qty   ?? item.quantity ?? 1,
        price: item.price ?? item.unitPrice ?? null,
      };
    });
  }, [order.rawItems]);

  const s = STATUS[localStatus] ?? STATUS.pending;

  return (
    <div className="ord-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ord-modal" role="dialog" aria-modal="true" aria-label={`Order ${order.id}`}>

        {/* ── Modal Header ── */}
        <div className="ord-modal-header">
          <button className="ord-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              fontWeight: 700,
              color: C.chocolate,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: C.creamDeep,
              padding: "3px 9px",
              borderRadius: 5,
              border: `1px solid ${C.line}`,
            }}>
              {order.id}
            </span>
            <StatusBadge status={localStatus} />
          </div>
          <h2 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 26,
            fontWeight: 400,
            fontStyle: "italic",
            color: C.espresso,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}>
            {order.customer}
          </h2>
        </div>

        {/* ── Modal Body ── */}
        <div className="ord-modal-body">

          {/* Customer Info */}
          <div style={{
            background: C.cream,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "4px 16px",
            marginBottom: 20,
          }}>
            {order.phone && (
              <div className="ord-detail-row">
                <div className="ord-detail-icon">
                  <Phone size={13} color="#C9818F" />
                </div>
                <div>
                  <p className="ord-detail-label">Phone</p>
                  <p className="ord-detail-value">{order.phone}</p>
                </div>
              </div>
            )}

            {order.address && (
              <div className="ord-detail-row">
                <div className="ord-detail-icon">
                  <MapPin size={13} color="#C9818F" />
                </div>
                <div>
                  <p className="ord-detail-label">Delivery Address</p>
                  <p className="ord-detail-value">{order.address}</p>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="ord-detail-row">
                <div className="ord-detail-icon">
                  <FileText size={13} color="#C9818F" />
                </div>
                <div>
                  <p className="ord-detail-label">Order Notes</p>
                  <p className="ord-detail-value" style={{ fontStyle: "italic", opacity: 0.85 }}>
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="ord-detail-row">
              <div className="ord-detail-icon">
                <Calendar size={13} color="#C9818F" />
              </div>
              <div>
                <p className="ord-detail-label">Date &amp; Time</p>
                <p className="ord-detail-value">{order.date} · {order.time}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.mist,
            marginBottom: 12,
          }}>
            Ordered Items
          </p>
          <div style={{
            background: C.cream,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "6px 16px",
            marginBottom: 20,
          }}>
            {displayItems.length > 0 ? (
              <table className="ord-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textAlign: "center", color: C.mist }}>×{item.qty}</td>
                      <td>
                        {item.price != null
                          ? `Rs. ${Number(item.price * item.qty).toLocaleString()}`
                          : <span style={{ color: C.mist, fontSize: 12 }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                padding: "12px 0",
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: C.mist,
              }}>
                {order.items.length > 0
                  ? order.items.map((name, i) => (
                      <div key={i} style={{
                        padding: "8px 0",
                        borderBottom: i < order.items.length - 1 ? `1px solid rgba(201,129,143,0.07)` : "none",
                        color: C.espresso,
                      }}>
                        {name}
                      </div>
                    ))
                  : "No items listed."}
              </div>
            )}

            {/* Total */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 12,
              marginTop: 4,
              borderTop: `1.5px solid ${C.line}`,
            }}>
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: C.mist,
              }}>
                Total
              </span>
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                fontWeight: 400,
                color: C.espresso,
              }}>
                Rs. {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status changer */}
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.mist,
            marginBottom: 10,
          }}>
            Update Status
          </p>
          <div style={{ position: "relative" }}>
            <select
              className="ord-status-select"
              value={localStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={saving}
              style={{
                color: s.color,
                background: s.bg,
                borderColor: s.border,
              }}
            >
              {CHANGEABLE_STATUSES.map((st) => (
                <option key={st} value={st} style={{ color: C.espresso, background: "#fff" }}>
                  {STATUS[st]?.label ?? st}
                </option>
              ))}
            </select>
          </div>
          {(saving || saveMsg) && (
            <div className="ord-status-saving">
              {saving && <RefreshCw size={12} style={{ animation: "ord-spin 1s linear infinite" }} />}
              <span style={{ color: saveMsg.includes("Failed") ? "#8B2020" : "#1E5C32" }}>
                {saving ? "Saving…" : saveMsg}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function Orders() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatus]       = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { orders, loading, error } = useOrders();

  const stats = useMemo(() => deriveStats(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q)       ||
        o.customer.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)    ||
        o.address.toLowerCase().includes(q)  ||
        o.items.some((i) => i.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  // Keep modal in sync when order data updates
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <OrdersStyles />

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <div style={{ fontFamily: FONT_BODY }}>

        {/* ── Page header ──────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            fontWeight: 400,
            fontStyle: "italic",
            color: C.espresso,
            marginBottom: 6,
            letterSpacing: "0.02em",
          }}>
            Orders
          </h1>
          <div style={{ width: 40, height: 1, background: "#C9818F", marginBottom: 26, opacity: 0.6 }} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.5 }}>
            View and manage customer orders. Click any order to see details and update its status.
          </p>
        </div>

        {/* ── Stats cards ─────────────────────────── */}
        <div
          className="ord-stats-row"
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}
        >
          <StatCard
            icon={ShoppingCart}
            iconColor="#C9818F"
            iconBg="rgba(201,129,143,0.12)"
            label="Today's Orders"
            value={stats.todayCount}
            delay={0}
          />
          <StatCard
            icon={Clock}
            iconColor="#A0620D"
            iconBg="rgba(201,129,143,0.10)"
            label="Pending"
            value={stats.pending}
            delay={0.05}
          />
          <StatCard
            icon={CheckCircle2}
            iconColor="#1E6E38"
            iconBg="rgba(34,139,70,0.09)"
            label="Delivered"
            value={stats.delivered}
            delay={0.10}
          />
          <StatCard
            icon={Banknote}
            iconColor="#C9818F"
            iconBg="rgba(201,129,143,0.08)"
            label="Revenue Today"
            value={`Rs. ${stats.revenue.toLocaleString()}`}
            delay={0.15}
          />
        </div>

        {/* ── Loading / error ─────────────────────── */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "18px 0", color: C.mist,
            fontFamily: FONT_BODY, fontSize: 13,
          }}>
            <RefreshCw size={14} style={{ animation: "ord-spin 1s linear infinite" }} />
            Loading orders…
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.22)",
            borderRadius: 8, padding: "14px 18px", marginBottom: 20,
            fontFamily: FONT_BODY, fontSize: 13, color: "#8B2020",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Toolbar ─────────────────────────────── */}
        <div className="ord-toolbar">
          {/* Search */}
          <div className="ord-search-wrap">
            <span className="ord-search-icon">
              <Search size={14} />
            </span>
            <input
              className="ord-search-input"
              type="text"
              placeholder="Search by ID, customer, address, or item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders"
            />
            {search && (
              <button
                className="ord-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="ord-filter-wrap">
            <select
              className="ord-filter-select"
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : STATUS[s]?.label ?? s}
                </option>
              ))}
            </select>
            <span className="ord-filter-chevron">
              <ChevronDown size={13} />
            </span>
          </div>

          {/* Result count */}
          {!loading && (
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              color: C.mist,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {/* ── Table card ──────────────────────────── */}
        {!loading && (
          <div className="ord-table-card">

            {filtered.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              <>
                {/* ─── Desktop table ──────────────────── */}
                <table className="ord-table">
                  <thead className="ord-table-head">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                      <th style={{ textAlign: "right" }}></th>
                    </tr>
                  </thead>
                  <tbody className="ord-table-body">
                    {filtered.map((order, i) => (
                      <tr
                        key={order.id}
                        style={{ animationDelay: `${i * 0.04}s` }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Order ID */}
                        <td>
                          <span style={{
                            fontFamily: FONT_BODY,
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: C.chocolate,
                            letterSpacing: "0.04em",
                            background: C.creamDeep,
                            padding: "2px 8px",
                            borderRadius: 5,
                            border: `1px solid ${C.line}`,
                          }}>
                            {order.id.length > 12 ? `…${order.id.slice(-8)}` : order.id}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <p style={{ fontWeight: 500, marginBottom: 1, color: C.espresso }}>
                            {order.customer}
                          </p>
                          {order.phone && (
                            <p style={{ fontSize: 11.5, color: C.mist, opacity: 0.8 }}>
                              {order.phone}
                            </p>
                          )}
                        </td>

                        {/* Items */}
                        <td style={{ maxWidth: 200 }}>
                          <ItemsList items={order.items} />
                        </td>

                        {/* Status */}
                        <td><StatusBadge status={order.status} /></td>

                        {/* Date */}
                        <td style={{ color: C.mist, fontSize: 12.5, whiteSpace: "nowrap" }}>
                          {order.date}
                        </td>

                        {/* Total */}
                        <td style={{ textAlign: "right", fontWeight: 600, color: C.espresso, whiteSpace: "nowrap" }}>
                          Rs. {Number(order.total).toLocaleString()}
                        </td>

                        {/* View */}
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="ord-view-btn"
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          >
                            <Eye size={11} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ─── Mobile card list ──────────────── */}
                <div className="ord-mobile-cards">
                  {filtered.map((order, i) => (
                    <div
                      key={order.id}
                      className="ord-mobile-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Top row: ID + badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{
                          fontFamily: FONT_BODY,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: C.chocolate,
                          letterSpacing: "0.04em",
                          background: C.creamDeep,
                          padding: "2px 8px",
                          borderRadius: 5,
                          border: `1px solid ${C.line}`,
                        }}>
                          {order.id.length > 12 ? `…${order.id.slice(-8)}` : order.id}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Customer */}
                      <p style={{ fontWeight: 600, fontSize: 14, color: C.espresso, marginBottom: 2 }}>
                        {order.customer}
                      </p>
                      {order.phone && (
                        <p style={{ fontSize: 12, color: C.mist, marginBottom: 8 }}>
                          {order.phone}
                        </p>
                      )}

                      {/* Items */}
                      <p style={{ fontSize: 12.5, color: C.espresso, marginBottom: 12 }}>
                        <ItemsList items={order.items} />
                      </p>

                      {/* Footer: date + total + chevron */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: C.mist }}>{order.date}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: C.espresso }}>
                            Rs. {Number(order.total).toLocaleString()}
                          </span>
                          <ChevronRight size={14} color={C.mist} opacity={0.5} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Table footer ──────────────────────── */}
            {filtered.length > 0 && (
              <div style={{
                padding: "11px 16px",
                borderTop: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.cream,
              }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>
                  Showing <strong style={{ color: C.espresso }}>{filtered.length}</strong> of{" "}
                  <strong style={{ color: C.espresso }}>{orders.length}</strong> orders
                </span>
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  color: C.mist,
                  opacity: 0.6,
                  fontStyle: "italic",
                }}>
                  Live · Firestore
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
