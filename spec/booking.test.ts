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
  const post = (path: string, body: URLSearchParams) =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });
  const bookRoom = (body: URLSearchParams) => post("/api/bookings", body);

  // Every test here books the Marie Reay 4.03 room (third seeded row) on a
  // fixed date, with a unique time slot per test so bookings never collide
  // with each other.
  const roomId = "3"; // Marie Reay Building (155) — Room 4.03
  const date = "2026-11-02";

  it("creates a booking and redirects to My Bookings", async () => {
    const res = await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "09:00",
        endTime: "10:00",
        studentId: "u0000001",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/bookings/?studentId=u0000001");
  });

  it("persists the booking: a fresh fetch of My Bookings shows it", async () => {
    await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "11:00",
        endTime: "12:00",
        studentId: "u0000002",
      }),
    );

    const res = await fetch(new URL("/bookings/?studentId=u0000002", baseUrl));
    const body = await res.text();
    expect(body).toContain("Room 4.03");
    expect(body).toContain("11:00");
    expect(body).toContain("12:00");
  });

  it("also shows the booking as taken on the room list for that date", async () => {
    await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "13:00",
        endTime: "13:30",
        studentId: "u0000003",
      }),
    );

    const res = await fetch(new URL(`/?date=${date}`, baseUrl));
    expect(await res.text()).toContain("Booked 13:00");
  });

  it("prevents a conflicting double booking for the same room and time", async () => {
    const okRes = await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "14:00",
        endTime: "15:00",
        studentId: "u0000004",
      }),
    );
    expect(okRes.status).toBe(303);
    expect(okRes.headers.get("location")).toBe("/bookings/?studentId=u0000004");

    const conflictRes = await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "14:30",
        endTime: "15:30",
        studentId: "u0000005",
      }),
    );
    expect(conflictRes.status).toBe(303);
    expect(conflictRes.headers.get("location")).toBe(`/?date=${date}&error=conflict`);

    const notBooked = await fetch(new URL("/bookings/?studentId=u0000005", baseUrl));
    expect(await notBooked.text()).toContain("No bookings found");
  });

  it("rejects a booking with no start/end gap", async () => {
    const res = await bookRoom(
      new URLSearchParams({
        roomId,
        date,
        startTime: "16:00",
        endTime: "16:00",
        studentId: "u0000006",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/?date=${date}&error=invalid`);
  });
});

describe("viewing and cancelling bookings", () => {
  const post = (path: string, body: URLSearchParams) =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  const roomId = "4"; // Chifley Library — Meeting Room 2.01
  const date = "2026-11-03";

  it("only cancels a booking when the Student ID matches", async () => {
    const owner = "u0000101";
    const bookRes = await post(
      "/api/bookings",
      new URLSearchParams({ roomId, date, startTime: "09:00", endTime: "10:00", studentId: owner }),
    );
    const bookingId = new URL(bookRes.headers.get("location") ?? "", baseUrl).searchParams.get(
      "studentId",
    );
    expect(bookingId).toBe(owner);

    const mine = await fetch(new URL(`/bookings/?studentId=${owner}`, baseUrl));
    const idMatch = (await mine.text()).match(/\/api\/bookings\/(\d+)\/cancel/);
    if (!idMatch) throw new Error("booking id not found on the My Bookings page");
    const id = idMatch[1];

    const wrongCancel = await post(
      `/api/bookings/${id}/cancel`,
      new URLSearchParams({ studentId: "someone-else" }),
    );
    expect(wrongCancel.status).toBe(303);
    expect(wrongCancel.headers.get("location")).toBe(
      "/bookings/?studentId=someone-else&error=not_found",
    );

    const stillThere = await fetch(new URL(`/bookings/?studentId=${owner}`, baseUrl));
    expect(await stillThere.text()).toContain("Meeting Room 2.01");

    const rightCancel = await post(`/api/bookings/${id}/cancel`, new URLSearchParams({ studentId: owner }));
    expect(rightCancel.status).toBe(303);
    expect(rightCancel.headers.get("location")).toBe(`/bookings/?studentId=${owner}`);

    const goneNow = await fetch(new URL(`/bookings/?studentId=${owner}`, baseUrl));
    expect(await goneNow.text()).toContain("No bookings found");
  });
});
