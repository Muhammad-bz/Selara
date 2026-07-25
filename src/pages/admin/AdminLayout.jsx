// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Settings, LogOut, Menu, X, ChevronLeft, ExternalLink,
} from "lucide-react";

const C = {
  cream:       "#FDF8F5",
  creamDeep:   "#F7EEE9",
  blush:       "#F2C4CE",
  petal:       "#E8A0B0",
  rose:        "#C9818F",
  charcoal:    "#1C1C1C",
  mist:        "#9A8A8A",
  line:        "rgba(201,129,143,0.15)",
  sidebarBg:   "#1A1215",
  sidebarLine: "rgba(242,196,206,0.08)",
};

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'Jost', system-ui, sans-serif";
const SIDEBAR_W      = 244;
const SIDEBAR_W_MINI = 64;

const NAV_ITEMS = [
  { to: "/admin",            label: "Dashboard",  icon: LayoutDashboard, end: true },
  { to: "/admin/products",   label: "Products",   icon: Package                    },
  { to: "/admin/categories", label: "Categories", icon: Tag                        },
  { to: "/admin/orders",     label: "Orders",     icon: ShoppingCart               },
  { to: "/admin/settings",   label: "Settings",   icon: Settings                   },
];

const PAGE_TITLES = {
  "/admin":            "Dashboard",
  "/admin/products":   "Products",
  "/admin/categories": "Categories",
  "/admin/orders":     "Orders",
  "/admin/settings":   "Settings",
};

function AdminGlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

      .selara-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1);
        will-change: transform, width;
      }
      .selara-sidebar.open { transform: translateX(0); }
      @media (min-width: 769px) { .selara-sidebar { transform: translateX(0) !important; } }
      .selara-sidebar.collapsed { width: ${SIDEBAR_W_MINI}px !important; }
      .selara-sidebar.expanded  { width: ${SIDEBAR_W}px !important; }

      .selara-main { margin-left: 0; transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); }
      @media (min-width: 769px) {
        .selara-main           { margin-left: ${SIDEBAR_W}px; }
        .selara-main.collapsed { margin-left: ${SIDEBAR_W_MINI}px; }
      }

      .selara-nav-link {
        display: flex; align-items: center; gap: 11px;
        padding: 10px 16px; border-radius: 3px; margin: 1px 10px;
        text-decoration: none; font-family: ${FONT_BODY};
        font-size: 11.5px; font-weight: 400; letter-spacing: 0.05em;
        color: rgba(253,248,245,0.37);
        border-left: 1.5px solid transparent;
        transition: color 0.2s, background 0.2s, border-color 0.2s;
        white-space: nowrap; overflow: hidden; position: relative;
      }
      .selara-nav-link:hover { color: #F2C4CE; background: rgba(242,196,206,0.07); }
      .selara-nav-link.active {
        color: #F2C4CE; background: rgba(242,196,206,0.1);
        font-weight: 500; border-left-color: #E8A0B0;
      }
      .selara-nav-link .nav-label { transition: opacity 0.2s, transform 0.2s; opacity: 1; transform: translateX(0); }

      .selara-sidebar.collapsed .nav-label { opacity: 0; pointer-events: none; transform: translateX(-6px); }
      .selara-sidebar.collapsed .selara-nav-link {
        justify-content: center; padding: 10px 0; margin: 1px 8px;
        border-left-color: transparent !important; border-radius: 6px;
      }
      .selara-sidebar.collapsed .selara-nav-link.active { background: rgba(242,196,206,0.14); }
      .selara-sidebar.collapsed .selara-nav-link::after {
        content: attr(data-label); position: absolute;
        left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
        background: #1C1C1C; color: #F2C4CE; font-family: ${FONT_BODY};
        font-size: 10.5px; font-weight: 500; letter-spacing: 0.07em;
        padding: 5px 10px; border-radius: 3px; white-space: nowrap;
        pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 999;
        border: 1px solid rgba(242,196,206,0.12);
      }
      .selara-sidebar.collapsed .selara-nav-link:hover::after { opacity: 1; }

      .selara-logout-btn {
        display: flex; align-items: center; gap: 9px; width: 100%;
        padding: 9px 13px; background: transparent;
        border: 1px solid rgba(242,196,206,0.13); border-radius: 2px;
        color: rgba(253,248,245,0.3); font-family: ${FONT_BODY};
        font-size: 9.5px; font-weight: 500; letter-spacing: 0.14em;
        text-transform: uppercase; cursor: pointer;
        transition: border-color 0.2s, color 0.2s, background 0.2s;
        white-space: nowrap; overflow: hidden;
      }
      .selara-logout-btn:hover { border-color: rgba(232,160,176,0.38); color: #E8A0B0; background: rgba(232,160,176,0.06); }
      .selara-sidebar.collapsed .selara-logout-btn { padding: 9px 0; justify-content: center; border-color: transparent; }
      .selara-sidebar.collapsed .logout-label { opacity: 0; pointer-events: none; width: 0; overflow: hidden; }

      .selara-collapse-btn {
        background: none; border: none; cursor: pointer; color: rgba(253,248,245,0.2);
        padding: 5px; border-radius: 4px; display: flex; align-items: center;
        justify-content: center; transition: color 0.2s, background 0.2s; flex-shrink: 0;
      }
      .selara-collapse-btn:hover { color: #F2C4CE; background: rgba(242,196,206,0.08); }
      .selara-collapse-btn svg { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
      .selara-collapse-btn.rotated svg { transform: rotate(180deg); }

      .sidebar-brand-sub { transition: opacity 0.2s, transform 0.2s; opacity: 1; transform: translateX(0); }
      .selara-sidebar.collapsed .sidebar-brand-sub { opacity: 0; transform: translateX(-6px); pointer-events: none; }
      .sidebar-brand-name { transition: font-size 0.2s, opacity 0.2s; }
      .selara-sidebar.collapsed .sidebar-brand-name { font-size: 0px !important; width: 0; overflow: hidden; opacity: 0; }

      .selara-page-title {
        font-family: ${FONT_DISPLAY}; font-size: 19px; font-weight: 400;
        font-style: italic; color: #1C1C1C; letter-spacing: 0.02em;
      }
      .selara-header-link {
        display: inline-flex; align-items: center; gap: 5px;
        font-family: ${FONT_BODY}; font-size: 9.5px; font-weight: 500;
        color: #9A8A8A; text-decoration: none; letter-spacing: 0.1em;
        text-transform: uppercase; padding: 6px 14px; border-radius: 2px;
        border: 1px solid rgba(201,129,143,0.15);
        transition: color 0.2s, border-color 0.2s, background 0.2s; white-space: nowrap;
      }
      .selara-header-link:hover { color: #C9818F; border-color: rgba(201,129,143,0.45); background: rgba(242,196,206,0.08); }

      .selara-overlay {
        position: fixed; inset: 0; background: rgba(26,12,18,0.62);
        z-index: 150; backdrop-filter: blur(3px); animation: selaraFadeIn 0.22s ease;
      }
      @keyframes selaraFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .selara-nav::-webkit-scrollbar { width: 2px; }
      .selara-nav::-webkit-scrollbar-thumb { background: rgba(242,196,206,0.12); border-radius: 2px; }
      @media (prefers-reduced-motion: reduce) {
        .selara-sidebar, .selara-main, .selara-nav-link, .selara-logout-btn,
        .selara-collapse-btn svg, .nav-label, .sidebar-brand-sub, .sidebar-brand-name { transition: none !important; }
      }
    `}</style>
  );
}

function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  }, [logout, navigate]);

  const sidebarClass = ["selara-sidebar", collapsed ? "collapsed" : "expanded", mobileOpen ? "open" : ""].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass} style={{
      width: collapsed ? SIDEBAR_W_MINI : SIDEBAR_W,
      position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 200,
      background: C.sidebarBg, display: "flex", flexDirection: "column",
      overflow: "hidden", boxShadow: "4px 0 28px rgba(0,0,0,0.25)",
    }}>
      {/* Brand */}
      <div style={{
        padding: "20px 14px 18px", borderBottom: `1px solid ${C.sidebarLine}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, minHeight: 68,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30,
            background: `linear-gradient(135deg, ${C.rose} 0%, ${C.petal} 100%)`,
            borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 12px rgba(201,129,143,0.45)",
          }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500, fontStyle: "italic", color: "#fff", lineHeight: 1 }}>S</span>
          </div>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <p className="sidebar-brand-name" style={{
              fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 400,
              fontStyle: "italic", color: C.blush, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.05em",
            }}>Selara</p>
            <p className="sidebar-brand-sub" style={{
              fontFamily: FONT_BODY, fontSize: 7.5, letterSpacing: "0.28em",
              textTransform: "uppercase", color: "rgba(242,196,206,0.3)", marginTop: 3, whiteSpace: "nowrap",
            }}>Admin Panel</p>
          </div>
        </div>
        <button className={`selara-collapse-btn${collapsed ? " rotated" : ""}`} onClick={onCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} style={{ flexShrink: 0 }}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={onMobileClose} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "rgba(253,248,245,0.28)", padding: 4, flexShrink: 0 }} aria-label="Close sidebar">
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="selara-nav" style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
        {!collapsed && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 8, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(253,248,245,0.16)", padding: "6px 20px 8px" }}>Navigation</p>
        )}
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} data-label={label}
            className={({ isActive }) => `selara-nav-link${isActive ? " active" : ""}`}
            onClick={onMobileClose}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: C.sidebarLine, margin: "0 16px", flexShrink: 0 }} />

      {/* Footer */}
      <div style={{ padding: "14px 12px 18px", flexShrink: 0, overflow: "hidden" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(242,196,206,0.1)", border: "1px solid rgba(242,196,206,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontStyle: "italic", color: C.blush, lineHeight: 1 }}>
                {(user?.email?.[0] ?? "A").toUpperCase()}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: "rgba(253,248,245,0.42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 8, color: C.rose, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Administrator</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(242,196,206,0.1)", border: "1px solid rgba(242,196,206,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 11px" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontStyle: "italic", color: C.blush, lineHeight: 1 }}>
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </span>
          </div>
        )}
        <button className="selara-logout-btn" onClick={handleLogout}>
          <LogOut size={12} style={{ flexShrink: 0 }} />
          <span className="logout-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}

function TopHeader({ onMobileMenuOpen }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin";
  return (
    <header style={{
      height: 56, background: C.cream, borderBottom: `1px solid ${C.line}`,
      display: "flex", alignItems: "center", padding: "0 28px", gap: 14,
      flexShrink: 0, position: "sticky", top: 0, zIndex: 90,
      boxShadow: "0 1px 0 rgba(201,129,143,0.06)",
    }}>
      <button onClick={onMobileMenuOpen} aria-label="Open navigation" style={{
        background: "none", border: "none", cursor: "pointer", color: C.mist,
        padding: 6, borderRadius: 4, display: "flex", alignItems: "center", transition: "color 0.2s, background 0.2s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F7EEE9"; e.currentTarget.style.color = C.rose; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.mist; }}
      >
        <Menu size={17} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 9.5, color: C.mist, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.65 }}>Admin</span>
        <span style={{ color: C.blush, fontSize: 14, lineHeight: 1 }}>/</span>
        <span className="selara-page-title">{pageTitle}</span>
      </div>
      <div style={{ flex: 1 }} />
      <a href="/" target="_blank" rel="noreferrer" className="selara-header-link">
        <ExternalLink size={10} />
        View site
      </a>
    </header>
  );
}

export default function AdminLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 769 : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const update = (e) => { setIsDesktop(e.matches); if (e.matches) setMobileOpen(false); };
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile     = useCallback(() => setMobileOpen(true),  []);
  const closeMobile    = useCallback(() => setMobileOpen(false), []);

  const effectiveCollapsed = isDesktop ? collapsed : false;
  const mainMargin = isDesktop ? (collapsed ? SIDEBAR_W_MINI : SIDEBAR_W) : 0;

  return (
    <>
      <AdminGlobalStyles />
      {mobileOpen && !isDesktop && (
        <div className="selara-overlay" role="presentation" onClick={closeMobile} />
      )}
      <Sidebar collapsed={effectiveCollapsed} mobileOpen={mobileOpen} onCollapse={toggleCollapse} onMobileClose={closeMobile} />
      <div className={`selara-main${effectiveCollapsed ? " collapsed" : ""}`} style={{
        marginLeft: mainMargin, display: "flex", flexDirection: "column",
        minHeight: "100vh", background: "#F7EEE9",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <TopHeader onMobileMenuOpen={openMobile} />
        <main style={{ flex: 1, padding: "36px 32px 48px", maxWidth: 1100, width: "100%", boxSizing: "border-box" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
