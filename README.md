Me & Coach — Frontend
React + Vite + Tailwind, built to the "Me &" family Design & Product Principles. Deploy this after the backend (see backend/README.md for the required SQL → Backend → Frontend order).
Setup
npm install
Copy .env.example to .env, fill in VITE_API_URL and Supabase keys.
npm run dev
Where each principle lives in the code
Principle
File(s)
#1 Phone+password auth, no email/OTP
src/pages/Login.jsx, src/lib/api.js (login())
#2 Uniform box sizing, no calendar picker, numeric keyboards, dropdowns for constrained values
src/components/DateInput.jsx, src/components/SegmentedToggle.jsx, src/pages/StudentDetail.jsx (status dropdown)
#3 Solid colourful stat cards, paper-style list rows, dashed empty state
src/components/StatCard.jsx, src/components/EmptyState.jsx, src/pages/Dashboard.jsx
#4 Tamil-first nav with English subtitle
src/components/TopBar.jsx, src/components/BottomNav.jsx
#5 Respect real-world notation / auto-fill
src/pages/Attendance.jsx (batch roster auto-loaded from schedule, no re-typing)
#6 Editable records with "Edited" transparency note
src/components/EditedBadge.jsx, used in StudentDetail.jsx and Payments.jsx
Notes
Data reads/writes all go through the backend API (src/lib/api.js), not directly through the Supabase client, so RLS scoping and edit-tracking stay centralized in one place.
src/lib/offlineQueue.js uses localStorage for the attendance queue. This is fine here — this is a real, deployed app the coach installs to their phone, not a live in-chat preview, so browser storage is the correct tool for offline queuing.
