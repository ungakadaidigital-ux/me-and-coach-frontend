import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

/** Present-rate over the last 30 days, via the API (RLS-scoped server-side). */
export function useAttendanceStats() {
  const [pct, setPct] = useState(null);

  useEffect(() => {
    api
      .get("/api/attendance/stats?days=30")
      .then((data) => setPct(data.pct))
      .catch(() => setPct(null));
  }, []);

  return pct;
}
