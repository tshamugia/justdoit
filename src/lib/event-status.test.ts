import { describe, it, expect } from "vitest";
import { computeEventStatus } from "./event-status";

describe("computeEventStatus", () => {
  const futureDate = "2099-12-31";
  const today = "2026-03-03";

  it('returns "happening" when inCount >= minAttendees', () => {
    expect(computeEventStatus(5, 5, "pending", futureDate, today)).toBe(
      "happening"
    );
    expect(computeEventStatus(10, 5, "pending", futureDate, today)).toBe(
      "happening"
    );
  });

  it('returns "pending" when inCount is 0', () => {
    expect(computeEventStatus(0, 5, "pending", futureDate, today)).toBe(
      "pending"
    );
    expect(computeEventStatus(0, 5, "happening", futureDate, today)).toBe(
      "pending"
    );
  });

  it('returns "at_risk" when below threshold and previously "happening"', () => {
    expect(computeEventStatus(3, 5, "happening", futureDate, today)).toBe(
      "at_risk"
    );
  });

  it('returns "at_risk" when below threshold and previously "at_risk"', () => {
    expect(computeEventStatus(3, 5, "at_risk", futureDate, today)).toBe(
      "at_risk"
    );
  });

  it('returns "pending" when below threshold and previously "pending"', () => {
    expect(computeEventStatus(3, 5, "pending", futureDate, today)).toBe(
      "pending"
    );
  });

  it("does not change status when event date is past", () => {
    const pastDate = "2020-01-01";
    expect(computeEventStatus(10, 5, "pending", pastDate, today)).toBe(
      "pending"
    );
    expect(computeEventStatus(0, 5, "happening", pastDate, today)).toBe(
      "happening"
    );
    expect(computeEventStatus(3, 5, "at_risk", pastDate, today)).toBe(
      "at_risk"
    );
  });
});
