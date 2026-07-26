import React from "react";
import { ChevronLeft, Bell } from "lucide-react";

export default function TopBar({ title, titleEn, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-ink">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 rounded-full active:opacity-60">
            <ChevronLeft size={20} color="#fff" />
          </button>
        )}
        <div>
          <div className="text-white font-semibold text-[15px] leading-tight font-display">{title}</div>
          {titleEn && <div className="text-[11px] text-white/50 leading-tight">{titleEn}</div>}
        </div>
      </div>
      {right ?? <Bell size={18} color="#fff" />}
    </div>
  );
}
