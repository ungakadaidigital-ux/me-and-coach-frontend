import React from "react";

// Design & Product Principles #2: two option buttons (e.g. Today / This
// Month) must never sit flush against each other reading as one control.
// Each option is its own taller box with a two-line label — local
// language on top, English underneath — so the boxes read as clearly
// separate, equal-sized choices no matter how long each label is.
export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="rounded-xl py-2.5 px-2 text-center transition-colors"
            style={{
              background: active ? "#131A2B" : "#FFFFFF",
              border: "1px solid #E7E0D2",
            }}
          >
            <div className={`text-sm font-semibold leading-tight ${active ? "text-white" : "text-ink"}`}>{opt.ta}</div>
            <div className={`text-[11px] leading-tight ${active ? "text-white/70" : "text-inksoft"}`}>{opt.en}</div>
          </button>
        );
      })}
    </div>
  );
}
