import React from "react";

// Design & Product Principles #2: payment status is a constrained value,
// not free text — this chip is fed from a dropdown of exactly these
// three values everywhere in the app (see Payments.jsx / StudentDetail.jsx).
const MAP = {
  paid: { label: "கட்டி முடிச்சாச்சு", bg: "#E5F3EA", fg: "#2E7D4F" },
  due: { label: "நிலுவை", bg: "#FCF3E3", fg: "#C97F16" },
  overdue: { label: "தாமதம்", bg: "#FBEAE4", fg: "#BD4128" },
};

export default function StatusChip({ status }) {
  const s = MAP[status] || MAP.due;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}
