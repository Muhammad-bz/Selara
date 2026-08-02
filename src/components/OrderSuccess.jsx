import React from "react";
import { X, Check, Clock } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY } from "../constants/theme";

const WHATSAPP_NUMBER = "03364231346"; // digits only for the wa.me link
const WHATSAPP_DISPLAY = "0336 4231346";

/* ═══════════════════════════════════════════════
   ORDER SUCCESS SCREEN
   Props:
     onClose        — closes the drawer
     paymentMethod  — "online" | "cod" | undefined
═══════════════════════════════════════════════ */
export default function OrderSuccess({ onClose, paymentMethod }) {
  const isOnline = paymentMethod === "online";
  const isCod    = paymentMethod === "cod";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "flex-end",
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: C.parchment, border: "none", borderRadius: "50%",
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={15} color={C.espresso} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="order-success">

        {/* Icon */}
        <div className="order-success-icon">
          {isCod
            ? <Check size={28} color="#22A84A" strokeWidth={2.5} />
            : <Clock size={28} color={C.espresso} strokeWidth={2} />
          }
        </div>

        {/* Headline */}
        <h3 style={{
          fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 400,
          color: C.espresso, marginBottom: 10,
        }}>
          {isCod ? "Order Confirmed!" : "Order Placed!"}
        </h3>

        {/* Sub-message */}
        {isOnline && (
          <>
            <p style={{
              fontFamily: FONT_BODY, fontSize: 14, color: C.mist,
              lineHeight: 1.65, maxWidth: 300, marginBottom: 10, textAlign: "center",
            }}>
              Your payment is being confirmed. Please send a <strong style={{ color: C.espresso }}>screenshot</strong> of your transfer to WhatsApp to complete your order.
            </p>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#25D366",
                color: "#fff",
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 6,
                textDecoration: "none",
                marginBottom: 20,
              }}
            >
              {/* WhatsApp icon (inline SVG, no external dep) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send Screenshot — {WHATSAPP_DISPLAY}
            </a>
          </>
        )}

        {isCod && (
          <p style={{
            fontFamily: FONT_BODY, fontSize: 14, color: C.mist,
            lineHeight: 1.65, maxWidth: 280, marginBottom: 28, textAlign: "center",
          }}>
            Thank you! Your order is confirmed and will be delivered to your door. Pay cash on delivery.
          </p>
        )}

        {/* Fallback if paymentMethod not provided */}
        {!isOnline && !isCod && (
          <p style={{
            fontFamily: FONT_BODY, fontSize: 14, color: C.mist,
            lineHeight: 1.65, maxWidth: 280, marginBottom: 28, textAlign: "center",
          }}>
            Thank you! We've received your order and will be in touch shortly to confirm your delivery.
          </p>
        )}

        <button className="btn-primary" onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
