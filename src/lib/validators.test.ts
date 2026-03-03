import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createEventSchema,
  createWorkspaceSchema,
  joinWorkspaceSchema,
} from "./validators";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com" }).success).toBe(
      false
    );
    expect(loginSchema.safeParse({ password: "password123" }).success).toBe(
      false
    );
  });
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password mismatch", () => {
    const result = registerSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      fullName: "J",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEventSchema", () => {
  const validEvent = {
    title: "Team Lunch",
    eventDate: "2026-04-01",
    eventTime: "12:00",
    minAttendees: 3,
  };

  it("accepts valid input", () => {
    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createEventSchema.safeParse({
      eventDate: validEvent.eventDate,
      eventTime: validEvent.eventTime,
      minAttendees: validEvent.minAttendees,
    });
    expect(result.success).toBe(false);
  });

  it("rejects minAttendees < 2", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      minAttendees: 1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      description: "A nice lunch",
      location: "Cafe",
      maxAttendees: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("A nice lunch");
      expect(result.data.location).toBe("Cafe");
      expect(result.data.maxAttendees).toBe(10);
    }
  });

  it("enforces category enum", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for category and isAnonymous", () => {
    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("other");
      expect(result.data.isAnonymous).toBe(false);
    }
  });
});

describe("createWorkspaceSchema", () => {
  it("accepts valid input", () => {
    const result = createWorkspaceSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
  });

  it("rejects name too short", () => {
    const result = createWorkspaceSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects name too long", () => {
    const result = createWorkspaceSchema.safeParse({ name: "A".repeat(51) });
    expect(result.success).toBe(false);
  });
});

describe("joinWorkspaceSchema", () => {
  it("accepts valid input", () => {
    const result = joinWorkspaceSchema.safeParse({ inviteCode: "ABC123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = joinWorkspaceSchema.safeParse({ inviteCode: "" });
    expect(result.success).toBe(false);
  });
});
