import React from "react";
import { fromISODate } from "./DateInput";

// Design & Product Principles #6: nothing is a silent, permanent record.
// Any edited row shows a small transparency note instead of quietly
// rewriting history.
export default function EditedBadge({ isEdited, editedAt }) {
  if (!isEdited) return null;
  const date = editedAt ? fromISODate(editedAt.slice(0, 10)) : "";
  return (
    <span className="text-[11px] font-medium text-inksoft/70 italic">
      திருத்தப்பட்டது · Edited {date}
    </span>
  );
}
