import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

/**
 * Returns the academy's configured custom fields for a vertical,
 * e.g. [{ field_key: 'belt', field_label_ta: '...', field_type: 'select', options: [...] }]
 * Render student.custom_fields[field_key] using this, not a
 * hardcoded per-vertical map — a new academy can define different
 * fields for the same vertical without a code change.
 */
export function useVerticalConfigs(vertical) {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vertical) return;
    setLoading(true);
    api
      .get(`/api/vertical-configs?vertical=${encodeURIComponent(vertical)}`)
      .then(setConfigs)
      .finally(() => setLoading(false));
  }, [vertical]);

  return { configs, loading };
}

