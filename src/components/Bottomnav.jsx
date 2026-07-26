import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, ClipboardCheck, IndianRupee, Calendar } from "lucide-react";

// Every tab is the same fixed width/height regardless of Tamil label
// length — Design & Product Principles #2 (uniform row/box alignment).
const NAV = [
  { to: "/", label: "முகப்பு", labelEn: "Home", icon: Home, end: true },
  { to: "/students", label: "மாணவர்கள்", labelEn: "Students", icon: Users },
  { to: "/attendance", label: "வருகை", labelEn: "Attendance", icon: ClipboardCheck },
  { to: "/payments", label: "கட்டணம்", labelEn: "Payments", icon: IndianRupee },
  { to: "/schedule", label: "அட்டவணை", labelEn: "Schedule", icon: Calendar },
];

export default function BottomNav() {
  return (
    <div className="flex items-stretch border-t border-line bg-white">
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className="flex-1 flex flex-col items-center gap-1 py-2.5">
          {({ isActive }) => (
            <>
              <n.icon size={18} color={isActive ? "#C97F16" : "#5B6478"} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold" style={{ color: isActive ? "#C97F16" : "#5B6478" }}>{n.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
