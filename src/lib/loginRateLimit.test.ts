import { describe, expect, it } from "vitest";
import { createLoginRateLimiter } from "./loginRateLimit";

const MINUTE = 60 * 1000;
const T0 = 1_000_000;

describe("createLoginRateLimiter", () => {
  it("allows attempts when there are no recorded failures", () => {
    const limiter = createLoginRateLimiter();
    expect(limiter.check("admin", T0)).toEqual({ blocked: false });
  });

  it("allows attempts below the failure threshold", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 4; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    expect(limiter.check("admin", T0 + 4 * MINUTE)).toEqual({ blocked: false });
  });

  it("blocks after 5 failures within the window", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    const decision = limiter.check("admin", T0 + 5 * MINUTE);
    expect(decision.blocked).toBe(true);
  });

  it("reports how long until the block lifts (oldest failure + window)", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    const decision = limiter.check("admin", T0 + 5 * MINUTE);
    // Oldest failure at T0, window 15 min, checked at T0+5 min → 10 min left.
    expect(decision).toEqual({ blocked: true, retryAfterMs: 10 * MINUTE });
  });

  it("unblocks once the oldest failure slides out of the window", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    expect(limiter.check("admin", T0 + 14 * MINUTE).blocked).toBe(true);
    // At T0+15 min the T0 failure has expired, leaving 4 in the window.
    expect(limiter.check("admin", T0 + 15 * MINUTE)).toEqual({ blocked: false });
  });

  it("clears the failure history on success", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    limiter.recordSuccess("admin");
    expect(limiter.check("admin", T0 + 5 * MINUTE)).toEqual({ blocked: false });
  });

  it("tracks each username independently", () => {
    const limiter = createLoginRateLimiter();
    for (let i = 0; i < 5; i++) {
      limiter.recordFailure("admin", T0 + i * MINUTE);
    }
    expect(limiter.check("admin", T0 + 5 * MINUTE).blocked).toBe(true);
    expect(limiter.check("editor", T0 + 5 * MINUTE)).toEqual({ blocked: false });
  });

  it("respects custom maxFailures and windowMs options", () => {
    const limiter = createLoginRateLimiter({ maxFailures: 2, windowMs: MINUTE });
    limiter.recordFailure("admin", T0);
    limiter.recordFailure("admin", T0 + 1000);
    expect(limiter.check("admin", T0 + 2000).blocked).toBe(true);
    expect(limiter.check("admin", T0 + MINUTE + 1000)).toEqual({ blocked: false });
  });
});
