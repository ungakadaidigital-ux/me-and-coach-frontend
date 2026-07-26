import React from "react";

// Design & Product Principles #3: no data ≠ a plain "no data" text line.
// A dashed-border watermark card signals "something will appear here"
// rather than reading like a broken or unfinished screen.
export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-card border-2 border-dashed border-line py-10 flex flex-col items-center justify-center text-center px-4">
      {Icon && <Icon size={28} className="text-inksoft/40 mb-2" />}
      <div className="text-sm font-semibold text-inksoft">{title}</div>
      {subtitle && <div className="text-xs text-inksoft/70 mt-0.5">{subtitle}</div>}
    </div>
  );
}
