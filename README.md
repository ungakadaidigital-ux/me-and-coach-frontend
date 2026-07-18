# Me & Coach — Frontend (Week 2)

Same visual design as the prototype, now wired to the real API and
Supabase auth instead of mock arrays.

## Setup
1. `npm install`
2. Copy `.env.example` → `.env`, point `VITE_API_BASE_URL` at your
   deployed (or local) backend, fill in Supabase URL/anon key
3. `npm run dev`

## What changed vs. the prototype
- `STUDENTS`/`SCHEDULE` mock arrays → `useStudents`/`useBatches` hooks
  hitting the real Express API
- Custom field labels (belt/position/grade) → fetched per-academy
  from `useVerticalConfigs`, not hardcoded. This is the actual
  config-driven behavior the prototype's caption claimed but didn't
  yet implement.
- Attendance marking → `useAttendance` queues marks and bulk-syncs;
  a synced "absent" mark auto-fires the WhatsApp alert (backend-side)
- Payments "send reminder" → real call to `/api/payments/:id/send-reminder`
- Added a phone+OTP login screen (the prototype had none — it assumed
  a logged-in state)

## Known gaps (carried over from the backend README, plus new ones)
- Attendance sync queue is in-memory only — survives a flaky network
  while the app stays open, NOT an app kill/reload while offline.
  Real offline support needs a persisted queue (IndexedDB on web,
  SQLite if this becomes a React Native app per the original stack
  choice) — deferred, not silently dropped.
- Same-day-only attendance edit lock: still not enforced anywhere
  (frontend or backend) — flagged twice now, worth doing before pilot.
- No owner UI yet for defining `vertical_configs` — the backend route
  exists (`POST /api/vertical-configs`), but there's no screen to use
  it. Right now an academy's field config has to be inserted directly
  via SQL/Supabase Studio.
