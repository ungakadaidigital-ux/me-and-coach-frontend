import { createClient } from "@supabase/supabase-js";

// Used ONLY for holding the auth session client-side. All data reads/writes
// go through the backend API (src/lib/api.js) so RLS + edit-tracking logic
// lives in one place.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
