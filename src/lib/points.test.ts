import { describe, it, expect } from "vitest";
import {
  calculateRsvpPointDelta,
  calculateWithdrawPointDelta,
  applyPointDelta,
} from "./points";

describe("calculateRsvpPointDelta", () => {
  it('returns +5 for new "in" (no previous)', () => {
    expect(calculateRsvpPointDelta("in", null)).toBe(5);
  });

  it('returns +5 for "maybe" -> "in"', () => {
    expect(calculateRsvpPointDelta("in", "maybe")).toBe(5);
  });

  it('returns -5 for "in" -> "maybe"', () => {
    expect(calculateRsvpPointDelta("maybe", "in")).toBe(-5);
  });

  it('returns 0 for "maybe" -> "maybe"', () => {
    expect(calculateRsvpPointDelta("maybe", "maybe")).toBe(0);
  });

  it('returns 0 for "in" -> "in" (re-RSVP)', () => {
    expect(calculateRsvpPointDelta("in", "in")).toBe(0);
  });

  it('returns 0 for new "maybe" (no previous)', () => {
    expect(calculateRsvpPointDelta("maybe", null)).toBe(0);
  });
});

describe("calculateWithdrawPointDelta", () => {
  it('returns -5 for withdrawing "in"', () => {
    expect(calculateWithdrawPointDelta("in")).toBe(-5);
  });

  it('returns 0 for withdrawing "maybe"', () => {
    expect(calculateWithdrawPointDelta("maybe")).toBe(0);
  });

  it("returns 0 for null (no previous RSVP)", () => {
    expect(calculateWithdrawPointDelta(null)).toBe(0);
  });
});

describe("applyPointDelta", () => {
  it("applies positive delta", () => {
    expect(applyPointDelta(10, 5)).toBe(15);
  });

  it("applies negative delta", () => {
    expect(applyPointDelta(10, -5)).toBe(5);
  });

  it("never goes below 0", () => {
    expect(applyPointDelta(3, -5)).toBe(0);
    expect(applyPointDelta(0, -10)).toBe(0);
  });

  it("handles zero delta", () => {
    expect(applyPointDelta(10, 0)).toBe(10);
  });
});
