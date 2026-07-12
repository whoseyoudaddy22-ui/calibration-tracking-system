import { describe, expect, it } from "vitest";
import { getToolStatus } from "./status";

const now = new Date("2026-07-12T00:00:00Z");
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

describe("getToolStatus", () => {
  it("returns expired when the expiry date is in the past", () => {
    expect(getToolStatus(daysFromNow(-1), now)).toBe("expired");
    expect(getToolStatus(daysFromNow(-60), now)).toBe("expired");
  });

  it("returns expired the instant it passes now (0 remaining is not expired, negative is)", () => {
    expect(getToolStatus(now, now)).toBe("warning");
  });

  it("returns warning at the 30-day boundary (inclusive)", () => {
    expect(getToolStatus(daysFromNow(30), now)).toBe("warning");
  });

  it("returns normal just past the 30-day boundary", () => {
    expect(getToolStatus(daysFromNow(31), now)).toBe("normal");
  });

  it("returns normal for dates far in the future", () => {
    expect(getToolStatus(daysFromNow(365), now)).toBe("normal");
  });

  it("returns warning for dates just inside the warning window", () => {
    expect(getToolStatus(daysFromNow(1), now)).toBe("warning");
  });
});
