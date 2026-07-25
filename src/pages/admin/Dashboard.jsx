// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  collection, query, orderBy, limit, onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Package, ShoppingCart, Clock, CheckCircle2,
  Banknote, TrendingUp, RefreshCw, AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   SELARA DESIGN TOKENS
───────────────────────────────────────────────── */
const C = {
  cream:      "#FDF8F5",
  creamDeep:  "#F7EEE9",
  parchment:  "#EFE0D8",
  blush:      "#F2C4CE",
  petal:      "#E8A0B0",
  rose:       "#C9818F",
  charcoal:   "#1C1C1C",
  slate:      "#4A4A4A",
  mist:       "#9A8A8A",
  line:       "rgba(201,129,143,0.15)",
  lineStrong: "rgba(201,129,143,0.25)",
  green:      "#2D7A4F",
  greenBg:    "rgba(45,122,79,0.08)",
  greenBdr:   "rgba(45,122,79,0.22)",
  amber:      "#A07030",
  amberBg:    "rgba(160,112,48,0.09)",
  amberBdr:   "rgba(160,112,48,0.25)",
  red:        "#B54A4A",
  redBg:      "rgba(181,74,74,0.07)",
  redBdr:     "rgba(181,74,74,0.2)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'Jost', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   HELPERS  (unchanged)
───────────────────────────────────────────────── */
function tsToDate(ts) {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return null;
}
function fmtDate(ts) {
  const d = tsToDate(ts);
  if (!d) return "—";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}
function fmtAgo(ts) {
  const d = tsToDate(ts);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function fmtMoney(n) {
  return `Rs. ${Number(n || 0).toLocaleString()}`;
}

const STATUS_META = {
  pending:    { label: "Pending",    color: C.amber,  bg: C.amberBg, border: C.amberBdr, dot: C.amber  },
  processing: { label: "Processing", color: C.rose,   bg: "rgba(201,129,143,0.1)", border: "rgba(201,129,143,0.28)", dot: C.rose },
  completed:  { label: "Completed",  color: C.green,  bg: C.greenBg, border: C.greenBdr, dot: C.green  },
  delivered:  { label: "Delivered",  color: C.green,  bg: C.greenBg, border: C.greenBdr, dot: C.green  },
  cancelled:  { label: "Cancelled",  color: C.red,    bg: C.redBg,   border: C.redBdr,   dot: C.red    },
};
function normStatus(raw) { return (raw ?? "pending").toLowerCase(); }

/* ─────────────────────────────────────────────────
   FIRESTORE HOOKS  (unchanged)
───────────────────────────────────────────────── */
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5));
    const unsub = onSnapshot(q,
      (snap) => { setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); setError(null); },
      (err)  => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);
  return { products, loading, error };
}

function useOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q,
      (snap) => { setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); setError(null); },
      (err)  => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);
  return { orders, loading, error };
}

/* ─────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────── */
function DashStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

      .dash-stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
        gap: 14px;
        margin-bottom: 26px;
      }
      .dash-stat-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 6px;
        padding: 20px 20px 18px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        box-shadow: 0 1px 4px rgba(201,129,143,0.06);
        animation: dash-rise 0.38s ease both;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .dash-stat-card:hover {
        box-shadow: 0 4px 20px rgba(201,129,143,0.1);
        transform: translateY(-1px);
      }
      .dash-stat-icon {
        width: 38px; height: 38px;
        border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dash-stat-label {
        font-family: ${FONT_BODY};
        font-size: 9.5px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${C.mist};
        margin-bottom: 5px;
      }
      .dash-stat-value {
        font-family: ${FONT_DISPLAY};
        font-size: 30px;
        font-weight: 400;
        color: ${C.charcoal};
        line-height: 1;
        letter-spacing: 0.01em;
      }
      .dash-stat-sub {
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        color: ${C.mist};
        margin-top: 4px;
        opacity: 0.75;
      }

      .dash-section-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 820px) { .dash-section-grid { grid-template-columns: 1fr; } }

      .dash-panel {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(201,129,143,0.06);
        animation: dash-rise 0.42s ease both;
        animation-delay: 0.08s;
      }
      .dash-panel-header {
        padding: 14px 18px;
        border-bottom: 1px solid ${C.line};
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${C.cream};
      }
      .dash-panel-title {
        font-family: ${FONT_DISPLAY};
        font-size: 18px;
        font-weight: 400;
        font-style: italic;
        color: ${C.charcoal};
        letter-spacing: 0.02em;
      }
      .dash-panel-count {
        font-family: ${FONT_BODY};
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.07em;
        color: ${C.mist};
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
        border-radius: 20px;
        padding: 2px 10px;
      }

      .dash-order-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 18px;
        border-bottom: 1px solid rgba(201,129,143,0.08);
        transition: background 0.15s;
        animation: dash-row-in 0.28s ease both;
      }
      .dash-order-row:last-child { border-bottom: none; }
      .dash-order-row:hover { background: ${C.cream}; }

      .dash-product-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 18px;
        border-bottom: 1px solid rgba(201,129,143,0.08);
        transition: background 0.15s;
        animation: dash-row-in 0.28s ease both;
      }
      .dash-product-row:last-child { border-bottom: none; }
      .dash-product-row:hover { background: ${C.cream}; }
      .dash-product-thumb {
        width: 40px; height: 40px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
      }
      .dash-product-thumb-fallback {
        width: 40px; height: 40px;
        border-radius: 4px;
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
        flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }

      .dash-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px 2px 6px;
        border-radius: 20px;
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        font-weight: 500;
        letter-spacing: 0.03em;
        white-space: nowrap;
      }

      .dash-order-id {
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        font-weight: 600;
        color: ${C.rose};
        letter-spacing: 0.08em;
        background: rgba(201,129,143,0.08);
        border: 1px solid rgba(201,129,143,0.18);
        border-radius: 3px;
        padding: 1px 7px;
      }

      .dash-empty {
        padding: 36px 18px;
        text-align: center;
        font-family: ${FONT_BODY};
        font-size: 13px;
        color: ${C.mist};
      }
      .dash-loading {
        display: flex; align-items: center; justify-content: center;
        gap: 8px; padding: 36px 18px;
        font-family: ${FONT_BODY}; font-size: 12.5px;
        color: ${C.mist};
      }
      .dash-spin { animation: dash-spin 1s linear infinite; }

      .dash-welcome {
        background: linear-gradient(115deg, ${C.charcoal} 0%, #2d1820 100%);
        border-radius: 6px;
        padding: 22px 26px;
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 2px 16px rgba(28,12,18,0.18);
        animation: dash-rise 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .dash-welcome::before {
        content: '';
        position: absolute;
        top: -30px; right: -30px;
        width: 140px; height: 140px;
        border-radius: 50%;
        background: rgba(242,196,206,0.06);
        pointer-events: none;
      }

      @keyframes dash-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes dash-row-in {
        from { opacity: 0; transform: translateX(-4px); }
        to   { opacity: 1; transform: translateX(0);    }
      }
      @keyframes dash-spin { to { transform: rotate(360deg); } }

      @media (max-width: 600px) {
        .dash-stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .dash-stat-card { padding: 14px 14px; }
        .dash-stat-value { font-size: 24px; }
        .dash-welcome { flex-direction: column; align-items: flex-start; }
      }
      @media (max-width: 360px) { .dash-stat-grid { grid-template-columns: 1fr; } }
      @media (prefers-reduced-motion: reduce) {
        .dash-stat-card, .dash-panel, .dash-order-row,
        .dash-product-row, .dash-welcome { animation: none !important; }
        .dash-stat-card:hover { transform: none !important; }
        .dash-spin { animation: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   STAT CARD  (UI only)
───────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, delay = 0 }) {
  return (
    <div className="dash-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="dash-stat-icon" style={{ background: iconBg }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        {sub && <p className="dash-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   STATUS BADGE  (UI only)
───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_META[normStatus(status)] ?? STATUS_META.pending;
  return (
    <span className="dash-badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   RECENT ORDERS  (logic unchanged)
───────────────────────────────────────────────── */
function RecentOrders({ orders, loading, error }) {
  const recent = useMemo(() => orders.slice(0, 6), [orders]);
  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <span className="dash-panel-title">Recent Orders</span>
        {!loading && <span className="dash-panel-count">{orders.length} total</span>}
      </div>

      {loading && <div className="dash-loading"><RefreshCw size={13} className="dash-spin" /> Loading…</div>}
      {error && !loading && (
        <div className="dash-empty" style={{ color: C.red }}>
          <AlertTriangle size={14} style={{ marginBottom: 4 }} /><br />{error}
        </div>
      )}
      {!loading && !error && recent.length === 0 && <div className="dash-empty">No orders yet.</div>}

      {!loading && !error && recent.map((order, i) => {
        const itemCount = Array.isArray(order.items) ? order.items.length : 0;
        return (
          <div key={order.id} className="dash-order-row" style={{ animationDelay: `${i * 0.04}s` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <span className="dash-order-id">#{order.id.slice(-6).toUpperCase()}</span>
                <StatusBadge status={order.status} />
              </div>
              <p style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
                color: C.charcoal, marginBottom: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {order.customerName ?? order.customer ?? "—"}
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""} · {fmtAgo(order.createdAt)}
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 400, color: C.charcoal, whiteSpace: "nowrap" }}>
                {fmtMoney(order.total)}
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 2 }}>
                {fmtDate(order.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   RECENT PRODUCTS  (logic unchanged)
───────────────────────────────────────────────── */
function RecentProducts({ products, loading, error }) {
  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <span className="dash-panel-title">Recent Products</span>
        {!loading && <span className="dash-panel-count">{products.length} shown</span>}
      </div>

      {loading && <div className="dash-loading"><RefreshCw size={13} className="dash-spin" /> Loading…</div>}
      {error && !loading && (
        <div className="dash-empty" style={{ color: C.red }}>
          <AlertTriangle size={14} style={{ marginBottom: 4 }} /><br />{error}
        </div>
      )}
      {!loading && !error && products.length === 0 && <div className="dash-empty">No products yet.</div>}

      {!loading && !error && products.map((p, i) => (
        <div key={p.id} className="dash-product-row" style={{ animationDelay: `${i * 0.04}s` }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="dash-product-thumb" loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="dash-product-thumb-fallback">
              <Package size={15} color={C.mist} opacity={0.45} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
              color: C.charcoal, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {p.name ?? "Unnamed"}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist }}>{p.category ?? "—"}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400, color: C.charcoal, whiteSpace: "nowrap" }}>
              {fmtMoney(p.price)}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 2 }}>
              {fmtAgo(p.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN DASHBOARD  (logic completely unchanged)
───────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { products, loading: prodLoading, error: prodError } = useProducts();
  const { orders,   loading: ordLoading,  error: ordError  } = useOrders();

  const stats = useMemo(() => {
    const pending   = orders.filter((o) => normStatus(o.status) === "pending").length;
    const delivered = orders.filter((o) => ["completed", "delivered"].includes(normStatus(o.status))).length;
    const revenue   = orders
      .filter((o) => ["completed", "delivered"].includes(normStatus(o.status)))
      .reduce((s, o) => s + (Number(o.total) || 0), 0);
    return { totalProducts: products.length, totalOrders: orders.length, pending, delivered, revenue };
  }, [products, orders]);

  const anyLoading = prodLoading || ordLoading;

  return (
    <>
      <DashStyles />
      <div style={{ fontFamily: FONT_BODY }}>

        {/* ── Page heading ── */}
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400,
          fontStyle: "italic", color: C.charcoal, marginBottom: 6, letterSpacing: "0.02em",
        }}>
          Dashboard
        </h1>
        <div style={{ width: 40, height: 1, background: C.rose, marginBottom: 26, opacity: 0.6 }} />

        {/* ── Welcome banner ── */}
        <div className="dash-welcome">
          <div>
            <p style={{
              fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 400,
              fontStyle: "italic", color: "#fff", marginBottom: 5, letterSpacing: "0.02em",
            }}>
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: "rgba(242,196,206,0.6)", letterSpacing: "0.04em" }}>
              {anyLoading ? "Fetching live data…" : `${stats.totalOrders} order${stats.totalOrders !== 1 ? "s" : ""} · ${stats.pending} pending`}
            </p>
          </div>
          {anyLoading && <RefreshCw size={16} color="rgba(242,196,206,0.4)" className="dash-spin" />}
        </div>

        {/* ── Stat cards ── */}
        <div className="dash-stat-grid">
          <StatCard icon={Package}      iconColor={C.rose}   iconBg="rgba(201,129,143,0.1)"  label="Total Products" value={prodLoading ? "—" : stats.totalProducts} delay={0}    />
          <StatCard icon={ShoppingCart} iconColor={C.slate}  iconBg="rgba(74,74,74,0.07)"    label="Total Orders"   value={ordLoading  ? "—" : stats.totalOrders}   delay={0.05} />
          <StatCard icon={Clock}        iconColor={C.amber}  iconBg={C.amberBg}              label="Pending"        value={ordLoading  ? "—" : stats.pending}       sub="Awaiting fulfilment" delay={0.10} />
          <StatCard icon={CheckCircle2} iconColor={C.green}  iconBg={C.greenBg}              label="Delivered"      value={ordLoading  ? "—" : stats.delivered}     delay={0.15} />
          <StatCard icon={Banknote}     iconColor={C.rose}   iconBg="rgba(201,129,143,0.09)" label="Revenue"        value={ordLoading  ? "—" : fmtMoney(stats.revenue)} sub="From delivered orders" delay={0.20} />
          <StatCard icon={TrendingUp}   iconColor={C.green}  iconBg={C.greenBg}              label="Conversion"
            value={ordLoading || stats.totalOrders === 0 ? "—" : `${Math.round((stats.delivered / stats.totalOrders) * 100)}%`}
            sub="Delivered / total" delay={0.25}
          />
        </div>

        {/* ── Panels ── */}
        <div className="dash-section-grid">
          <RecentOrders  orders={orders}     loading={ordLoading}  error={ordError}  />
          <RecentProducts products={products} loading={prodLoading} error={prodError} />
        </div>

      </div>
    </>
  );
}
