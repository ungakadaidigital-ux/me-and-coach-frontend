import React from "react";

// Design & Product Principles #2: calendar date-pickers are avoided
// app-wide. Instead: a typed DD/MM/YYYY text field with a numeric
// keyboard and auto "/" insertion, used consistently everywhere a date
// is entered (join_date, due_date, etc).
//
// value/onChange work with plain "DD/MM/YYYY" strings. Parent components
// convert to ISO (YYYY-MM-DD) only when calling the API — see toISODate().

export function toISODate(ddmmyyyy) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

export function fromISODate(iso) {
  if (!iso) return "";
  const [y, mo, d] = iso.split("-");
  return `${d}/${mo}/${y}`;
}

export default function DateInput({ label, labelEn, value, onChange, id }) {
  const handleChange = (e) => {
    let digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    onChange(out);
  };

  return (
    <label htmlFor={id} className="block">
      {label && (
        <span className="block text-xs font-semibold mb-1 text-inksoft">
          {label} {labelEn && <span className="font-normal text-inksoft/70">· {labelEn}</span>}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={handleChange}
        maxLength={10}
        className="numeric-field w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-marigold"
      />
    </label>
  );
}
