import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "./auth";

describe("signToken and verifyToken", () => {
  it("sign then verify returns original payload", async () => {
    const payload = { userId: "user-123", email: "test@example.com" };
    const token = await signToken(payload);
    const result = await verifyToken(token);
    expect(result).toMatchObject(payload);
  });

  it("tampered token returns null", async () => {
    const payload = { userId: "user-123", email: "test@example.com" };
    const token = await signToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });

  it("invalid token returns null", async () => {
    const result = await verifyToken("not-a-valid-token");
    expect(result).toBeNull();
  });

  it("empty token returns null", async () => {
    const result = await verifyToken("");
    expect(result).toBeNull();
  });
});
