/**
 * In-memory login throttle (per client IP). Counts failed attempts within a
 * rolling window and locks the IP out once the limit is hit. Successful logins
 * clear the counter, so legitimate users are never locked out. Suitable for a
 * single-instance deploy; for multi-instance/serverless use a shared store.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 8;

type Entry = { failures: number; firstAt: number; lockedUntil: number };

const store = new Map<string, Entry>();

export function checkLoginAllowed(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function registerLoginFailure(key: string): void {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    entry = { failures: 0, firstAt: now, lockedUntil: 0 };
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + WINDOW_MS;
  }
  store.set(key, entry);

  // Light cleanup so the map can't grow unbounded.
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (v.lockedUntil < now && now - v.firstAt > WINDOW_MS) store.delete(k);
    }
  }
}

export function clearLoginFailures(key: string): void {
  store.delete(key);
}
