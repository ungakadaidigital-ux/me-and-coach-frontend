/**
 * Generic IndexedDB-backed offline queue.
 *
 * Why IndexedDB instead of the in-memory ref it replaces: a JS
 * variable dies the moment the tab/app is killed or reloaded while
 * offline. IndexedDB writes are durable — a coach can mark
 * attendance, lose signal, close the app, reopen it next day, and
 * the pending marks are still there waiting to sync.
 *
 * Kept dependency-free (raw IndexedDB API) to match this project's
 * lean-dependency style — no idb/dexie needed for a single store.
 */

const DB_NAME = "me-and-coach-offline";
const DB_VERSION = 1;
const STORE = "attendance_queue";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Persist one queued item. Called synchronously at mark-time, not at flush-time. */
export async function enqueue(item) {
  await withStore("readwrite", (store) => store.put(item));
}

/** All queued items, oldest first. */
export async function getAllQueued() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Queued items for one batch (used to rehydrate `marks` state after a reload). */
export async function getQueuedForBatch(batchId) {
  const all = await getAllQueued();
  return all.filter((item) => item.batch_id === batchId);
}

/** Remove items by id once the backend has confirmed them. */
export async function removeFromQueue(ids) {
  if (ids.length === 0) return;
  await withStore("readwrite", (store) => {
    ids.forEach((id) => store.delete(id));
  });
}
