import { describe, it, expect } from "vitest";
import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("allUsers returns expected tuple", () => {
    expect(queryKeys.allUsers()).toEqual(["all-users"]);
  });

  it("profile returns tuple with userId", () => {
    expect(queryKeys.profile("user-1")).toEqual(["profile", "user-1"]);
  });

  it("workspaces returns tuple with userId", () => {
    expect(queryKeys.workspaces("user-1")).toEqual(["workspaces", "user-1"]);
  });

  it("workspace returns tuple with workspaceId", () => {
    expect(queryKeys.workspace("ws-1")).toEqual(["workspace", "ws-1"]);
  });

  it("events returns tuple with workspaceId", () => {
    expect(queryKeys.events("ws-1")).toEqual(["events", "ws-1"]);
  });

  it("event returns tuple with eventId", () => {
    expect(queryKeys.event("evt-1")).toEqual(["event", "evt-1"]);
  });

  it("eventRsvps returns tuple with eventId", () => {
    expect(queryKeys.eventRsvps("evt-1")).toEqual(["event-rsvps", "evt-1"]);
  });

  it("workspaceMembers returns tuple with workspaceId", () => {
    expect(queryKeys.workspaceMembers("ws-1")).toEqual([
      "workspace-members",
      "ws-1",
    ]);
  });

  it("workspaceStats returns tuple with workspaceId", () => {
    expect(queryKeys.workspaceStats("ws-1")).toEqual([
      "workspace-stats",
      "ws-1",
    ]);
  });

  it("different IDs produce different keys", () => {
    expect(queryKeys.event("evt-1")).not.toEqual(queryKeys.event("evt-2"));
    expect(queryKeys.profile("u1")).not.toEqual(queryKeys.profile("u2"));
  });

  it("keys are readonly arrays (as const)", () => {
    const key = queryKeys.event("evt-1");
    // `as const` makes the type readonly at compile time; verify it's an array
    expect(Array.isArray(key)).toBe(true);
    expect(key.length).toBe(2);
  });
});
