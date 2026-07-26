import React from "react";

// Design & Product Principles #3: dashboard stat cards use solid,
// colourful backgrounds (not plain white), with a clear 3-tone
// hierarchy — label (dim), number (bold/prominent), caption (accent).
const TONES = {
  ink: { bg: "bg-ink", label: "text-white/60", number: "text-white", caption: "text-marigold" },
  teal: { bg: "bg-teal", label: "text-white/70", number: "text-white", caption: "text-white" },
  marigold: { bg: "bg-marigold", label: "text-ink/60", number: "text-ink", caption: "text-ink" },
  clay: { bg: "bg-clay", label: "text-white/70", number: "text-white", caption: "text-white" },
};

export default function StatCard({ tone = "ink", label, value, caption, className = "" }) {
  const t = TONES[tone];
  return (
    <div className={`rounded-card p-3.5 ${t.bg} ${className}`}>
      <div className={`text-xs mb-1 ${t.label}`}>{label}</div>
      <div className={`text-2xl font-bold font-display ${t.number}`}>{value}</div>
      {caption && <div className={`text-xs mt-0.5 font-semibold ${t.caption}`}>{caption}</div>}
    </div>
  );
}
