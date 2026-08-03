import React, { memo } from "react";
import { Shield, Truck, Award, Users } from "lucide-react";
import { C, FONT_BODY } from "../constants/theme";

/* ═══════════════════════════════════════════════
   TRUST STRIP
   PERF: Memoised — static content, never re-renders
═══════════════════════════════════════════════ */
const TRUST_ITEMS = [
  { icon: <Shield size={15} />, label: "Premium Fabrics" },
  { icon: <Truck size={15} />,  label: "Nationwide Delivery" },
  { icon: <Award size={15} />,  label: "Expert Craftsmanship" },
  { icon: <Users size={15} />,  label: "Loved by Customers" },
];

const TrustStrip = memo(function TrustStrip() {
  return (
    <div style={{ background: C.parchment, padding: "16px 5%", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
      <div className="trust-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {TRUST_ITEMS.map((it) => (
          <div
            key={it.label}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "10px 12px", color: C.rose,
              textAlign: "center",
            }}
          >
            {it.icon}
            <span style={{
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: C.slate,
            }}>
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default TrustStrip;
