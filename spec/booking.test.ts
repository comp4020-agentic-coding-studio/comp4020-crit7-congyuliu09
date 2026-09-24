import { describe, expect, inject, it } from "vitest";

// ANU RoomFlow's own spec tests, turning the crit 7 spec lines into checks
// against the running app. Grows stage by stage alongside the feature.
const baseUrl = inject("baseUrl");

describe("room directory", () => {
  it("lists the seeded rooms with building, name and capacity", async () => {
    const res = await fetch(baseUrl);
    const body = await res.text();
    expect(body).toContain("Marie Reay Building");
    expect(body).toContain("Room 4.03");
    expect(body).toContain("seats 30");
  });
});
