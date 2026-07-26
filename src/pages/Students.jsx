import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users } from "lucide-react";
import TopBar from "../components/TopBar";
import VTag, { VERTICALS } from "../components/VTag";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";

export default function Students() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter !== "all") params.vertical = filter;
    if (q) params.q = q;
    api.students(params).then((r) => setStudents(r.students || [])).finally(() => setLoading(false));
  }, [filter, q]);

  return (
    <div>
      <TopBar title="மாணவர்கள்" titleEn="Students" />
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 bg-white border border-line">
          <Search size={15} className="text-inksoft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="மாணவர் பெயர் தேடு..."
            className="text-sm outline-none flex-1 bg-transparent text-ink"
          />
        </div>
        {/* Filter chips: equal height, equal padding, regardless of Tamil label length
            (Design & Product Principles #2 — uniform row alignment). */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", ...Object.keys(VERTICALS)].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
              style={
                filter === k
                  ? { background: k === "all" ? "#131A2B" : VERTICALS[k].color, color: "#fff" }
                  : { background: "#fff", color: "#5B6478", border: "1px solid #E7E0D2" }
              }
            >
              {k === "all" ? "அனைத்தும்" : VERTICALS[k].ta}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-2 pb-4">
        {!loading && students.length === 0 && (
          <EmptyState icon={Users} title="எந்த மாணவரும் இல்லை" subtitle="மேலே '+' பட்டன் மூலம் ஒருவரை சேருங்கள்" />
        )}
        {students.map((s) => {
          const meta = VERTICALS[s.vertical];
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/students/${s.id}`)}
              className="w-full text-left flex items-center gap-3 rounded-xl p-3 bg-white border border-line"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: meta?.soft, color: meta?.color }}>
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">{s.name}</div>
                <div className="text-xs text-inksoft">{s.custom_fields?.[meta?.field] || "—"}</div>
              </div>
              <VTag vertical={s.vertical} small />
            </button>
          );
        })}
      </div>
    </div>
  );
}
