import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Send, CalendarX } from "lucide-react";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import SegmentedToggle from "../components/SegmentedToggle";
import EmptyState from "../components/EmptyState";
import { VERTICALS } from "../components/VTag";
import { api } from "../lib/api";

export default function Dashboard() {
  const [range, setRange] = useState("today");
  const [batches, setBatches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.batches(), api.payments({ status: "due" })])
      .then(([b, p]) => {
        setBatches(b.batches || []);
        setPayments(p.payments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const dueTotal = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div>
      <TopBar title="Me & Coach" titleEn="Dashboard" />
      <div className="px-4 pt-4 pb-6">
        <div className="mb-4">
          <SegmentedToggle
            value={range}
            onChange={setRange}
            options={[
              { value: "today", ta: "இன்று", en: "Today" },
              { value: "month", ta: "இந்த மாதம்", en: "This Month" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard tone="teal" label="இன்றைய வகுப்புகள்" value={batches.length} caption="3 verticals" />
          <StatCard tone="marigold" label="சராசரி வருகை" value="—" caption="வருகை பதிவு தொடங்கும்போது" />
          <div className="col-span-2 rounded-card p-3.5 bg-ink flex items-center justify-between">
            <div>
              <div className="text-xs mb-1 text-white/60">நிலுவை கட்டணம்</div>
              <div className="text-2xl font-bold font-display text-white">₹{dueTotal.toLocaleString("en-IN")}</div>
            </div>
            <Link to="/payments" className="text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1 bg-marigold text-ink">
              <Send size={13} /> நினைவூட்டல்
            </Link>
          </div>
        </div>

        <div className="text-sm font-semibold mb-2 text-ink">
          {range === "today" ? "இன்றைய அட்டவணை" : "இந்த மாத அட்டவணை"}
        </div>

        {!loading && batches.length === 0 && (
          <EmptyState icon={CalendarX} title="இன்னும் எந்த batch-உம் இல்லை" subtitle="Schedule tab-ல் ஒன்று சேருங்கள்" />
        )}

        <div className="space-y-2">
          {batches.slice(0, 4).map((b) => {
            const meta = VERTICALS[b.vertical];
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-xl p-2.5 bg-white border border-line">
                <div className="w-1 h-9 rounded-full" style={{ background: meta?.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-ink">{b.name}</div>
                  <div className="text-xs flex items-center gap-1 text-inksoft">
                    <Clock size={11} /> {b.start_time?.slice(0, 5)} <span className="mx-0.5">·</span> <MapPin size={11} /> {b.location}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
