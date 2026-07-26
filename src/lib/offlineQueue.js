// Attendance marked while offline is queued locally, then flushed to
// /api/attendance/bulk once the browser reports it's back online.
// (This is a real deployed PWA-style app — not a live in-chat artifact
// preview — so localStorage is the right, supported tool here.)
import { api } from "./api";

const KEY = "meandcoach_attendance_queue";

export function queueAttendance(record) {
  const queue = readQueue();
  queue.push(record);
  localStorage.setItem(KEY, JSON.stringify(queue));
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export async function flushQueue() {
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0 };
  const result = await api.attendanceBulk(queue);
  localStorage.removeItem(KEY);
  return result;
}

export function queueLength() {
  return readQueue().length;
}
