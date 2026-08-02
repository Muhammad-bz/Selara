import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { Check } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../constants/theme";

/* ═══════════════════════════════════════════════
   CHECKOUT FORM
   Collects customer details and submits to Firestore.
═══════════════════════════════════════════════ */
const EMPTY_CHECKOUT = { customerName: "", phone: "", address: "", notes: "" };

export default function CheckoutForm({ cart, total, onBack, onSuccess, settings = {} }) {
  const [form,       setForm]       = useState(EMPTY_CHECKOUT);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Name is required.";
    if (!form.phone.trim())        e.phone        = "Phone number is required.";
    if (!form.address.trim())      e.address      = "Delivery address is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    setSubmitErr("");

    try {
      const orderItems = cart.map((i) => ({
  id:             i.id,
  name:           i.name,
  price:          i.price,
  basePrice:      i.basePrice ?? i.price,
  qty:            i.qty,
  subtotal:       i.price * i.qty,
  img:            i.img ?? "",
  selectedSize:   i.selectedSize ?? null,
  selectedAddons: Array.isArray(i.selectedAddons) ? i.selectedAddons : [],
}));

      await addDoc(collection(db, "orders"), {
        customerName: form.customerName.trim(),
        phone:        form.phone.trim(),
        address:      form.address.trim(),
        notes:        form.notes.trim(),
        items:        orderItems,
        total,
        status:       "Pending",
        createdAt:    serverTimestamp(),
      });

      onSuccess();
    } catch (err) {
      console.error("Order submission error:", err);
      setSubmitErr("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${C.line}`,
        flexShrink: 0,
      }}>
        <button className="checkout-back-btn" onClick={onBack} disabled={submitting}>
          ← Back to Cart
        </button>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, color: C.espresso }}>
          Your Details
        </h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginTop: 2 }}>
          We'll use this to deliver your order
        </p>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {/* Order summary strip */}
        <div style={{
          background: C.creamDeep, border: `1px solid ${C.line}`,
          borderRadius: 6, padding: "12px 14px", marginBottom: 20,
        }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginBottom: 4 }}>
            {cart.reduce((s, i) => s + i.qty, 0)} item{cart.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
          </p>
          {cart.map((item, idx) => item.selectedSize ? (
            <p key={idx} style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginBottom: 2 }}>
              {item.name} — Size <span style={{ fontWeight: 600, color: C.espresso }}>{item.selectedSize}</span>
            </p>
          ) : null)}
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: C.espresso, marginTop: 6 }}>
            Total: {fmt(total)}
          </p>
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Customer Name *</label>
          <input
            className={`checkout-input${errors.customerName ? " error" : ""}`}
            type="text"
            placeholder="Full name"
            value={form.customerName}
            onChange={set("customerName")}
            disabled={submitting}
          />
          {errors.customerName && <span className="checkout-error">{errors.customerName}</span>}
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Phone Number *</label>
          <input
            className={`checkout-input${errors.phone ? " error" : ""}`}
            type="tel"
            placeholder="e.g. 0300 1234567"
            value={form.phone}
            onChange={set("phone")}
            disabled={submitting}
          />
          {errors.phone && <span className="checkout-error">{errors.phone}</span>}
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Delivery Address *</label>
          <textarea
            className={`checkout-input${errors.address ? " error" : ""}`}
            rows={3}
            placeholder="Street, area, city"
            value={form.address}
            onChange={set("address")}
            disabled={submitting}
            style={{ resize: "vertical", minHeight: 72 }}
          />
          {errors.address && <span className="checkout-error">{errors.address}</span>}
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Order Notes <span style={{ opacity: 0.6 }}>(optional)</span></label>
          <textarea
            className="checkout-input"
            rows={2}
            placeholder="Any special instructions, preferences, or notes…"
            value={form.notes}
            onChange={set("notes")}
            disabled={submitting}
            style={{ resize: "vertical" }}
          />
        </div>

        {submitErr && (
          <p style={{
            fontFamily: FONT_BODY, fontSize: 12, color: "#C0392B",
            background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 5, padding: "10px 12px", marginTop: 4,
          }}>
            {submitErr}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
        <button
          className="btn-primary"
          style={{ width: "100%", marginBottom: 10, opacity: submitting ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Placing Order…" : <><Check size={14} /> Place Order</>}
        </button>
        <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, textAlign: "center" }}>
          Or call / WhatsApp: <strong>{settings.whatsapp || settings.phone || ""}</strong>
        </p>
      </div>
    </div>
  );
}
