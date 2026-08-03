import React from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
   Performance optimisations applied:
   - Removed `transition: all` everywhere (use specific props)
   - GPU-composited properties only for animations
   - will-change used sparingly on real animation targets
   - CSS animations use transform/opacity only
═══════════════════════════════════════════════ */
export default function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        background: ${C.cream};
        color: ${C.espresso};
        font-family: ${FONT_BODY};
        overflow-x: hidden;
        max-width: 100%;
      }

      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

      /* Only GPU-composited props in keyframes */
      @keyframes fadeUp       { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn       { from { opacity: 0; } to { opacity: 1; } }
      @keyframes shimmer      { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes floatY       { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes cartBounce   { 0%,100% { transform: scale(1); } 40% { transform: scale(1.22); } 70% { transform: scale(0.92); } }
      @keyframes slideInRight { from { transform: translate3d(100%,0,0); } to { transform: translate3d(0,0,0); } }
      @keyframes petalDrop    { from { opacity: 0; transform: translateY(-8px) rotate(-3deg); } to { opacity: 1; transform: translateY(0) rotate(0deg); } }

      /* Reveal utility — only transform + opacity (compositor-only) */
      .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .reveal.visible { opacity: 1; transform: translateY(0); }

      /* Card lift */
      .card-lift { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
      @media (hover: hover) {
        .card-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(201,129,143,0.14); }
        .selara-product-card:hover .card-quick-add {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      }

      /* Nav links */
      .nav-link { position: relative; text-decoration: none; transition: color 0.2s; }
      .nav-link::after {
        content: '';
        position: absolute; bottom: -3px; left: 0;
        width: 0; height: 1px;
        background: ${C.blush};
        transition: width 0.3s ease;
      }
      .nav-link:hover::after { width: 100%; }
      .nav-link:hover { color: ${C.rose} !important; }

      /* Buttons — Selara style */
      .btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 32px;
        background: ${C.charcoal}; color: ${C.cream};
        font-family: ${FONT_BODY}; font-size: 11px; font-weight: 500;
        letter-spacing: 0.16em; text-transform: uppercase;
        border: none; border-radius: 0; cursor: pointer;
        transition: background 0.25s, transform 0.15s;
        text-decoration: none; white-space: nowrap;
      }
      .btn-primary:hover { background: ${C.rose}; transform: translateY(-1px); }
      .btn-primary:active { transform: translateY(0); }

      .btn-rose {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 32px;
        background: ${C.rose}; color: #fff;
        font-family: ${FONT_BODY}; font-size: 11px; font-weight: 500;
        letter-spacing: 0.16em; text-transform: uppercase;
        border: none; border-radius: 0; cursor: pointer;
        transition: background 0.25s, transform 0.15s; white-space: nowrap;
      }
      .btn-rose:hover { background: ${C.petal}; transform: translateY(-1px); }

      /* kept for backward compat */
      .btn-gold {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 32px;
        background: transparent; color: ${C.charcoal};
        font-family: ${FONT_BODY}; font-size: 11px; font-weight: 500;
        letter-spacing: 0.16em; text-transform: uppercase;
        border: 1px solid ${C.charcoal}; border-radius: 0; cursor: pointer;
        transition: background 0.25s, color 0.25s, transform 0.15s; white-space: nowrap;
      }
      .btn-gold:hover { background: ${C.charcoal}; color: #fff; transform: translateY(-1px); }

      .cart-bounce { animation: cartBounce 0.4s ease; }

      /* Shimmer placeholder */
      .img-placeholder {
        background: linear-gradient(90deg, ${C.creamDeep} 25%, ${C.parchment} 50%, ${C.creamDeep} 75%);
        background-size: 200% 100%;
        animation: shimmer 1.8s infinite;
      }

      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: ${C.creamDeep}; }
      ::-webkit-scrollbar-thumb { background: ${C.blush}; border-radius: 2px; }

      .divider { width: 40px; height: 1px; background: ${C.blush}; margin: 0 auto 20px; }
      .divider.left { margin-left: 0; }

      input, textarea, select { font-family: ${FONT_BODY}; }

      /* Responsive helpers */
      @media (max-width: 768px)  { .hide-mobile  { display: none !important; } }
      @media (min-width: 769px)  { .hide-desktop { display: none !important; } }

      /* Product grids */
      .product-grid-featured { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .product-grid          { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      @media (max-width: 1100px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 900px)  { .product-grid-featured { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  {
        .product-grid-featured { grid-template-columns: 1fr; }
        .product-grid          { grid-template-columns: 1fr; }
      }

      /* About section */
      .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
      @media (max-width: 860px) {
        .about-grid { grid-template-columns: 1fr; gap: 40px; }
        .about-image-col { order: -1; }
      }

      /* Contact section */
      .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
      @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr; gap: 48px; } }

      /* Footer */
      .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
      @media (max-width: 760px) {
        .footer-grid { grid-template-columns: 1fr 1fr; }
        .footer-brand { grid-column: 1 / -1; }
      }
      @media (max-width: 480px) {
        .footer-grid { grid-template-columns: 1fr; }
        .footer-brand { grid-column: auto; }
      }

      /* Trust strip */
      .trust-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        justify-items: center;
        text-align: center;
      }
      @media (max-width: 700px) {
        .trust-grid {
          grid-template-columns: repeat(2, 1fr);
          justify-items: center;
          text-align: center;
        }
      }

      /* Section padding */
      .section-pad { padding: 80px 5%; }
      @media (max-width: 640px) { .section-pad { padding: 56px 5%; } }

      /* Stats row */
      .stats-row { display: flex; gap: 36px; flex-wrap: wrap; }

      /* Cart drawer — GPU-composited slide */
      .cart-drawer {
        position: fixed; top: 0; right: 0; bottom: 0;
        width: min(420px, 100vw);
        background: ${C.cream};
        z-index: 2001;
        display: flex; flex-direction: column;
        animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1);
        box-shadow: -4px 0 48px rgba(201,129,143,0.12);
        will-change: transform;
      }

      /* ── Checkout form inside cart drawer ── */
      .checkout-field {
        display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px;
      }
      .checkout-label {
        font-family: ${FONT_BODY}; font-size: 10.5px; font-weight: 600;
        letter-spacing: 0.07em; text-transform: uppercase; color: ${C.mist};
      }
      .checkout-input {
        font-family: ${FONT_BODY}; font-size: 13.5px; color: ${C.espresso};
        background: ${C.creamDeep}; border: 1px solid ${C.line};
        border-radius: 5px; padding: 10px 12px; outline: none; width: 100%;
        box-sizing: border-box;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .checkout-input:focus {
        border-color: ${C.rose};
        box-shadow: 0 0 0 3px rgba(201,129,143,0.13);
      }
      .checkout-input.error { border-color: #C0392B; }
      .checkout-error {
        font-family: ${FONT_BODY}; font-size: 11px; color: #C0392B;
      }
      .checkout-back-btn {
        background: none; border: none; cursor: pointer;
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 600;
        color: ${C.mist}; letter-spacing: 0.05em; text-transform: uppercase;
        display: inline-flex; align-items: center; gap: 5px;
        padding: 0; margin-bottom: 18px;
        transition: color 0.18s;
      }
      .checkout-back-btn:hover { color: ${C.chocolate}; }

      /* ── Order success screen ── */
      .order-success {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; text-align: center;
        padding: 48px 28px; flex: 1;
        animation: fadeUp 0.45s ease;
      }
      .order-success-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(34,139,70,0.10);
        border: 1.5px solid rgba(34,139,70,0.28);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px;
      }

      /* Categories section — editorial grid */
      @media (min-width: 769px) {
        .cat-editorial-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        .cat-editorial-grid > *:first-child {
          grid-row: span 2;
        }
      }
      @media (max-width: 768px) {
        .cat-editorial-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      @media (max-width: 420px) {
        .cat-editorial-grid {
          grid-template-columns: 1fr !important;
        }
      }
        .reveal { transition: none; }
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
    `}</style>
  );
}
