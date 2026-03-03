export function calculateRsvpPointDelta(
  newStatus: "in" | "maybe",
  previousStatus: string | null
): number {
  if (newStatus === "in" && previousStatus !== "in") return 5;
  if (newStatus === "maybe" && previousStatus === "in") return -5;
  return 0;
}

export function calculateWithdrawPointDelta(
  previousStatus: string | null
): number {
  return previousStatus === "in" ? -5 : 0;
}

export function applyPointDelta(currentPoints: number, delta: number): number {
  return Math.max(0, currentPoints + delta);
}
