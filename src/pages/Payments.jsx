import React, { useEffect, useState } from "react";
import { Send, CircleCheck, IndianRupee } from "lucide-react";
import TopBar from "../components/TopBar";
import VTag from "../components/VTag";
import StatusChip from "../components/StatusChip";
import EditedBadge from "../components/EditedBadge";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [sentIds, setSentIds] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.payments({ status: "due" }).then((r) => setPayments(r.payments || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remind = async (p) => {
    await api.sendReminder(p.id);
    setSentIds((m) => ({ ...m, [p.id]: true }));
  };

  const markPaid = async (p) => {
    await api.markPaid(p.id, "cash");
    load();
  };

  const dueTotal = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div>
      <TopBar title="கட்டணம்" titleEn="Payments" />
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-card p-3 mb-3 bg-ink">
          <div className="text-xs text-white/60">மொத்த நிலுவை</div>
          <div className="text-xl font-bold font-display text-white">₹{dueTotal.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="px-4 space-y-2 pb-6">
        {!loading && payments.length === 0 && (
          <EmptyState icon={IndianRupee} title="நிலுவை கட்டணம் இல்லை" subtitle="எல்லாரும் கட்டி முடிச்சிட்டாங்க 🎉" />
        )}
        {payments.map((p) => (
          <div key={p.id} className="rounded-xl p-3 bg-white border border-line">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="text-sm font-semibold text-ink">{p.students?.name}</div>
                <VTag vertical={p.students?.vertical} small />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-clay">₹{p.amount}</div>
                <StatusChip status={p.status} />
              </div>
            </div>
            <EditedBadge isEdited={p.is_edited} editedAt={p.edited_at} />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => remind(p)}
                disabled={sentIds[p.id]}
                className="flex-1 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5"
                style={sentIds[p.id] ? { background: "#E5F3EA", color: "#2E7D4F" } : { background: "#E9F5EC", color: "#2E7D4F", border: "1px solid #BFE3CB" }}
              >
                {sentIds[p.id] ? <><CircleCheck size={13} /> அனுப்பிட்டாச்சு</> : <><Send size={13} /> WhatsApp நினைவூட்டல்</>}
              </button>
              <button onClick={() => markPaid(p)} className="text-xs font-semibold py-2 px-3 rounded-lg bg-chalkdeep text-ink">
                கட்டியாச்சு
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
