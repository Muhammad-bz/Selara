import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { Check, CreditCard, Truck } from "lucide-react";
import { C, FONT_DISPLAY, FONT_BODY, fmt } from "../constants/theme";

/* ═══════════════════════════════════════════════
   CHECKOUT FORM
   - Payment method: Online Transfer or COD
   - Split address fields: Province, City, Area,
     Street, House No., Landmark (optional)
═══════════════════════════════════════════════ */

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

const EMPTY_CHECKOUT = {
  customerName: "",
  phone: "",
  province: "",
  city: "",
  area: "",
  street: "",
  houseNo: "",
  landmark: "",
  notes: "",
  paymentMethod: "", // "online" | "cod"
};

const ONLINE_DETAILS = {
  accountName: "Sajween Fatima",
  bank: "Habib Bank Limited",
  accountNo: "22647902080799",
  whatsapp: "0336 4231346",
};

export default function CheckoutForm({ cart, total, onBack, onSuccess, settings = {} }) {
  const [form,       setForm]       = useState(EMPTY_CHECKOUT);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
  };

  const setPayment = (method) => {
    setForm((f) => ({ ...f, paymentMethod: method }));
    if (errors.paymentMethod) setErrors((er) => ({ ...er, paymentMethod: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim())  e.customerName  = "Name is required.";
    if (!form.phone.trim())         e.phone         = "Phone number is required.";
    if (!form.province)             e.province      = "Province is required.";
    if (!form.city.trim())          e.city          = "City is required.";
    if (!form.area.trim())          e.area          = "Area is required.";
    if (!form.street.trim())        e.street        = "Street is required.";
    if (!form.houseNo.trim())       e.houseNo       = "House / Flat number is required.";
    if (!form.paymentMethod)        e.paymentMethod = "Please select a payment method.";
    return e;
  };

  /* Build a readable address string for Firestore */
  const buildAddress = () =>
    [form.houseNo, form.street, form.area, form.city, form.province]
      .filter(Boolean)
      .join(", ") + (form.landmark ? ` (Near: ${form.landmark})` : "");

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
        customerName:  form.customerName.trim(),
        phone:         form.phone.trim(),
        address:       buildAddress(),
        addressFields: {
          province: form.province,
          city:     form.city.trim(),
          area:     form.area.trim(),
          street:   form.street.trim(),
          houseNo:  form.houseNo.trim(),
          landmark: form.landmark.trim(),
        },
        notes:         form.notes.trim(),
        paymentMethod: form.paymentMethod,
        items:         orderItems,
        total,
        status:        "Pending",
        createdAt:     serverTimestamp(),
      });

      onSuccess({ paymentMethod: form.paymentMethod });
    } catch (err) {
      console.error("Order submission error:", err);
      setSubmitErr("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Header ── */}
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

      {/* ── Form body ── */}
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

        {/* ── Personal info ── */}
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

        {/* ── Delivery Address ── */}
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 500,
          color: C.espresso, marginBottom: 10, marginTop: 4,
          letterSpacing: "0.03em",
        }}>
          Delivery Address
        </p>

        {/* Province */}
        <div className="checkout-field">
          <label className="checkout-label">Province *</label>
          <select
            className={`checkout-input${errors.province ? " error" : ""}`}
            value={form.province}
            onChange={set("province")}
            disabled={submitting}
            style={{ appearance: "auto" }}
          >
            <option value="">Select province…</option>
            {PAKISTAN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.province && <span className="checkout-error">{errors.province}</span>}
        </div>

        {/* City */}
        <div className="checkout-field">
          <label className="checkout-label">City *</label>
          <input
            className={`checkout-input${errors.city ? " error" : ""}`}
            type="text"
            placeholder="e.g. Lahore"
            value={form.city}
            onChange={set("city")}
            disabled={submitting}
          />
          {errors.city && <span className="checkout-error">{errors.city}</span>}
        </div>

        {/* Area */}
        <div className="checkout-field">
          <label className="checkout-label">Area / Town *</label>
          <input
            className={`checkout-input${errors.area ? " error" : ""}`}
            type="text"
            placeholder="e.g. DHA Phase 5"
            value={form.area}
            onChange={set("area")}
            disabled={submitting}
          />
          {errors.area && <span className="checkout-error">{errors.area}</span>}
        </div>

        {/* Street */}
        <div className="checkout-field">
          <label className="checkout-label">Street *</label>
          <input
            className={`checkout-input${errors.street ? " error" : ""}`}
            type="text"
            placeholder="e.g. Street 5, Block C"
            value={form.street}
            onChange={set("street")}
            disabled={submitting}
          />
          {errors.street && <span className="checkout-error">{errors.street}</span>}
        </div>

        {/* House No. */}
        <div className="checkout-field">
          <label className="checkout-label">House / Flat No. *</label>
          <input
            className={`checkout-input${errors.houseNo ? " error" : ""}`}
            type="text"
            placeholder="e.g. House 12 or Flat 3B"
            value={form.houseNo}
            onChange={set("houseNo")}
            disabled={submitting}
          />
          {errors.houseNo && <span className="checkout-error">{errors.houseNo}</span>}
        </div>

        {/* Landmark (optional) */}
        <div className="checkout-field">
          <label className="checkout-label">
            Famous Landmark <span style={{ opacity: 0.6 }}>(optional)</span>
          </label>
          <input
            className="checkout-input"
            type="text"
            placeholder="e.g. Near Packages Mall"
            value={form.landmark}
            onChange={set("landmark")}
            disabled={submitting}
          />
        </div>

        {/* ── Payment Method ── */}
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 500,
          color: C.espresso, marginBottom: 10, marginTop: 6,
          letterSpacing: "0.03em",
        }}>
          Payment Method *
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {/* Online Transfer card */}
          <button
            type="button"
            onClick={() => setPayment("online")}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "14px 12px",
              border: `2px solid ${form.paymentMethod === "online" ? C.espresso : C.line}`,
              borderRadius: 8,
              background: form.paymentMethod === "online" ? C.creamDeep : "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <CreditCard size={18} color={C.espresso} style={{ marginBottom: 6 }} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.espresso, fontWeight: 500 }}>
              Online Payment
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 10, color: C.mist, marginTop: 2 }}>
              Bank transfer
            </p>
          </button>

          {/* COD card */}
          <button
            type="button"
            onClick={() => setPayment("cod")}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "14px 12px",
              border: `2px solid ${form.paymentMethod === "cod" ? C.espresso : C.line}`,
              borderRadius: 8,
              background: form.paymentMethod === "cod" ? C.creamDeep : "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <Truck size={18} color={C.espresso} style={{ marginBottom: 6 }} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.espresso, fontWeight: 500 }}>
              Cash on Delivery
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 10, color: C.mist, marginTop: 2 }}>
              Nationwide only
            </p>
          </button>
        </div>

        {errors.paymentMethod && (
          <span className="checkout-error" style={{ display: "block", marginTop: -10, marginBottom: 14 }}>
            {errors.paymentMethod}
          </span>
        )}

        {/* Online payment details panel */}
        {form.paymentMethod === "online" && (
          <div style={{
            background: C.creamDeep,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 16,
          }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.espresso, fontWeight: 500, marginBottom: 10 }}>
              Transfer Details
            </p>
            {[
              ["Account Name", ONLINE_DETAILS.accountName],
              ["Bank",         ONLINE_DETAILS.bank],
              ["Account No.",  ONLINE_DETAILS.accountNo],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>{label}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.espresso, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <div style={{
              marginTop: 12,
              background: "rgba(0,0,0,0.04)",
              borderRadius: 6,
              padding: "10px 12px",
            }}>
              <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.espresso, lineHeight: 1.6 }}>
                After transferring, send a <strong>screenshot</strong> to confirm your order on WhatsApp:
                {" "}<strong>{ONLINE_DETAILS.whatsapp}</strong>
              </p>
            </div>
          </div>
        )}

        {/* COD info panel */}
        {form.paymentMethod === "cod" && (
          <div style={{
            background: C.creamDeep,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.espresso, lineHeight: 1.6 }}>
              Pay cash when your order arrives at your door. Available <strong>nationwide</strong> across Pakistan.
            </p>
          </div>
        )}

        {/* Notes */}
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

      {/* ── Footer ── */}
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
          Or call / WhatsApp: <strong>{settings.whatsapp || settings.phone || ONLINE_DETAILS.whatsapp}</strong>
        </p>
      </div>
    </div>
  );
}
