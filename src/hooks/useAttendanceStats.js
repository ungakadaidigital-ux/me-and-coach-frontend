import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

/** Present-rate over the last 30 days, scoped by RLS same as everything else. */
export function useAttendanceStats() {
  const [pct, setPct] = useState(null);

  useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    supabase
      .from("attendance")
      .select("status")
      .gte("session_date", since.toISOString().slice(0, 10))
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return setPct(null);
        const present = data.filter((r) => r.status === "present").length;
        setPct(Math.round((present / data.length) * 100));
      });
  }, []);

  return pct;
}

