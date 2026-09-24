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

describe("booking a room", () => {
  // Astro checks form POSTs carry a same-origin Origin header (CSRF
  // protection); browsers send it automatically, a bare fetch doesn't.
  const post = (body: URLSearchParams) =>
    fetch(new URL("/api/bookings", baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  // Every test here books the Marie Reay 4.03 room (third seeded row) on a
  // fixed date, with a unique time slot per test so bookings never collide
  // with each other.
  const roomId = "3"; // Marie Reay Building (155) — Room 4.03
  const date = "2026-11-02";

  it("creates a booking and redirects back to the room list", async () => {
    const res = await post(
      new URLSearchParams({
        roomId,
        date,
        startTime: "09:00",
        endTime: "10:00",
        studentId: "u0000001",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/?date=${date}`);
  });

  it("persists the booking: a fresh fetch of the room list shows it as booked", async () => {
    await post(
      new URLSearchParams({
        roomId,
        date,
        startTime: "11:00",
        endTime: "12:00",
        studentId: "u0000002",
      }),
    );

    const res = await fetch(new URL(`/?date=${date}`, baseUrl));
    const body = await res.text();
    expect(body).toContain("Booked 11:00");
    expect(body).toContain("12:00");
  });

  it("prevents a conflicting double booking for the same room and time", async () => {
    const okRes = await post(
      new URLSearchParams({
        roomId,
        date,
        startTime: "14:00",
        endTime: "15:00",
        studentId: "u0000003",
      }),
    );
    expect(okRes.status).toBe(303);
    expect(okRes.headers.get("location")).toBe(`/?date=${date}`);

    const conflictRes = await post(
      new URLSearchParams({
        roomId,
        date,
        startTime: "14:30",
        endTime: "15:30",
        studentId: "u0000004",
      }),
    );
    expect(conflictRes.status).toBe(303);
    expect(conflictRes.headers.get("location")).toBe(`/?date=${date}&error=conflict`);

    const res = await fetch(new URL(`/?date=${date}`, baseUrl));
    const body = await res.text();
    // exactly one booking in the 14:xx slot survived — the conflicting one
    // never made it in
    expect(body.match(/Booked 14:00/g)?.length).toBe(1);
    expect(body).not.toContain("14:30");
  });

  it("rejects a booking with no start/end gap", async () => {
    const res = await post(
      new URLSearchParams({
        roomId,
        date,
        startTime: "16:00",
        endTime: "16:00",
        studentId: "u0000005",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/?date=${date}&error=invalid`);
  });
});
