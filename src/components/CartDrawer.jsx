import React, { useState, useEffect, useMemo } from "react";
import { ShoppingBag, X, Minus, Plus } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../constants/theme";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";

/* ═══════════════════════════════════════════════
   CART DRAWER
   Steps: "cart" → "checkout" → "success"
   PERF: Conditionally rendered only when open.
         slideInRight uses translate3d (GPU-composited).
═══════════════════════════════════════════════ */
export default function CartDrawer({ open, onClose, cart, updateQty, removeItem, onOrderSuccess, settings = {} }) {
  // "cart" | "checkout" | "success"
  const [step,          setStep]          = useState("cart");
  const [paymentMethod, setPaymentMethod] = useState("");

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!open) { setStep("cart"); setPaymentMethod(""); }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleSuccess = ({ paymentMethod: method } = {}) => {
    setPaymentMethod(method ?? "");
    setStep("success");
    onOrderSuccess?.();
  };

  return (
    <>
      <div
        role="presentation"
        onClick={step === "success" ? onClose : onClose}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(46,26,14,0.5)",
          zIndex: 2000,
          animation: "fadeIn 0.25s ease",
        }}
      />
      <div className="cart-drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">

        {/* ── Step: success ── */}
        {step === "success" && (
          <OrderSuccess onClose={onClose} paymentMethod={paymentMethod} />
        )}

        {/* ── Step: checkout form ── */}
        {step === "checkout" && (
          <CheckoutForm
            cart={cart}
            total={total}
            onBack={() => setStep("cart")}
            onSuccess={handleSuccess}
            settings={settings}
          />
        )}

        {/* ── Step: cart ── */}
        {step === "cart" && (
          <>
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.line}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, color: C.espresso }}>
                  Your Order
                </h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginTop: 2 }}>
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                style={{
                  background: C.parchment, border: "none", borderRadius: "50%",
                  width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <X size={15} color={C.espresso} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <ShoppingBag size={36} color={C.parchment} style={{ margin: "0 auto 16px", display: "block" }} />
                  <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.mist, fontWeight: 300 }}>
                    Your cart is empty
                  </p>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.parchment, marginTop: 6 }}>
                    Add something great!
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    style={{ display: "flex", gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${C.line}` }}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: 62, height: 62, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400,
                        color: C.espresso, marginBottom: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.name}
                      </p>
                      <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.gold, fontWeight: 500 }}>
                        {fmt(item.price)}
                      </p>
                      {item.selectedSize && (
                        <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginTop: 2, lineHeight: 1.4 }}>
                          Size: <span style={{ fontWeight: 600, color: C.espresso }}>{item.selectedSize}</span>
                        </p>
                      )}
                      {Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0 && (
                        <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginTop: 2, lineHeight: 1.4 }}>
                          + {item.selectedAddons.map((a) => a.name ?? a.title).filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => { if (item.qty <= 1) removeItem(item.id); else updateQty(item.id, -1); }}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.line}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Minus size={11} color={C.mist} />
                        </button>
                        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, minWidth: 18, textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.id, 1)}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.line}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Plus size={11} color={C.mist} />
                        </button>
                        <button
                          aria-label="Remove item"
                          onClick={() => removeItem(item.id)}
                          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.mist, opacity: 0.45 }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist }}>Subtotal</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: C.espresso }}>
                    {fmt(total)}
                  </span>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: "100%", marginBottom: 10 }}
                  onClick={() => setStep("checkout")}
                >
                  Proceed to Checkout
                </button>
                <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, textAlign: "center" }}>
                  Or call / WhatsApp: <strong>{settings.whatsapp || settings.phone || ""}</strong>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
