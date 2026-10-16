/**
 * Simple in-memory sliding window rate limiter.
 * Good enough for a single-instance Vercel deployment.
 * For multi-region, swap with @upstash/ratelimit + Redis.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export function rateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowSecs * 1000 });
    return true; // allowed
  }

  if (entry.count >= options.limit) {
    return false; // blocked
  }

  entry.count += 1;
  return true; // allowed
}

// Periodic cleanup to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);
