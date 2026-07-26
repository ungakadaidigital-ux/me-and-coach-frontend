import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { VERTICALS } from "../components/VTag";
import { CalendarX } from "lucide-react";
import { api } from "../lib/api";

const DAY_LABELS = ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"];

export default function Schedule() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.batches().then((r) => setBatches(r.batches || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="அட்டவணை" titleEn="Schedule" />
      <div className="px-4 pt-3 pb-6 space-y-2">
        {!loading && batches.length === 0 && (
          <EmptyState icon={CalendarX} title="இன்னும் batch இல்லை" subtitle="ஒரு batch சேர்த்து ஆரம்பியுங்கள்" />
        )}
        {batches.map((b) => {
          const meta = VERTICALS[b.vertical];
          const Icon = meta?.icon;
          return (
            <div key={b.id} className="flex items-center gap-3 rounded-xl p-3 bg-white border border-line">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta?.soft }}>
                {Icon && <Icon size={18} color={meta.color} strokeWidth={2.2} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">{b.name}</div>
                <div className="text-xs text-inksoft">
                  {b.location} · {b.days_of_week?.map((d) => DAY_LABELS[d]).join(", ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: meta?.color }}>{b.start_time?.slice(0, 5)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
