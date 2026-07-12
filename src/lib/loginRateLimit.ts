const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export type RateLimitDecision =
  | { blocked: false }
  | { blocked: true; retryAfterMs: number };

/**
 * Sliding-window rate limiter for login attempts, keyed by username.
 * In-memory on purpose: the app runs as a single Node process (local-only
 * per project policy), so no shared store is needed. State resets on
 * restart, which is acceptable for slowing brute-force attempts.
 *
 * Factory + injectable clock so the logic can be unit tested directly,
 * same pattern as decideRedirect in src/lib/routeAccess.ts.
 */
export function createLoginRateLimiter({
  maxFailures = MAX_FAILURES,
  windowMs = WINDOW_MS,
}: { maxFailures?: number; windowMs?: number } = {}) {
  const failures = new Map<string, number[]>();

  function recentFailures(key: string, now: number): number[] {
    const pruned = (failures.get(key) ?? []).filter((at) => now - at < windowMs);
    if (pruned.length === 0) {
      failures.delete(key);
    } else {
      failures.set(key, pruned);
    }
    return pruned;
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitDecision {
      const recent = recentFailures(key, now);
      if (recent.length < maxFailures) return { blocked: false };
      const oldestRelevant = recent[recent.length - maxFailures];
      return { blocked: true, retryAfterMs: oldestRelevant + windowMs - now };
    },

    recordFailure(key: string, now: number = Date.now()): void {
      const recent = recentFailures(key, now);
      failures.set(key, [...recent, now]);
    },

    recordSuccess(key: string): void {
      failures.delete(key);
    },
  };
}

export type LoginRateLimiter = ReturnType<typeof createLoginRateLimiter>;

// Shared instance used by the login server action. globalThis keeps the
// state across dev-mode hot reloads (same trick as src/lib/prisma.ts).
const globalForRateLimit = globalThis as unknown as {
  loginRateLimiter?: LoginRateLimiter;
};

export const loginRateLimiter =
  globalForRateLimit.loginRateLimiter ?? createLoginRateLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.loginRateLimiter = loginRateLimiter;
}
