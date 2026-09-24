import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Booking, type Room, bookings, rooms } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

// ANU RoomFlow ships with a starting directory of real-feeling spaces so the
// app never opens on an empty room list. Seeding only when the table is
// empty keeps this idempotent across every boot, local or deployed.
const SEED_ROOMS: Array<Omit<Room, "id">> = [
  {
    building: "Hancock Library",
    roomName: "Group Study Room 1.02",
    capacity: 6,
    roomType: "Group study room",
  },
  {
    building: "Hancock Library",
    roomName: "Silent Pod 3.14",
    capacity: 1,
    roomType: "Silent study pod",
  },
  {
    building: "Marie Reay Building (155)",
    roomName: "Room 4.03",
    capacity: 30,
    roomType: "Bookable classroom",
  },
  {
    building: "Chifley Library",
    roomName: "Meeting Room 2.01",
    capacity: 8,
    roomType: "Meeting room",
  },
  {
    building: "CSIT Building (108)",
    roomName: "Seminar Room N101",
    capacity: 40,
    roomType: "Seminar room",
  },
  {
    building: "Kambri",
    roomName: "Innovation Hub Room 1",
    capacity: 12,
    roomType: "Collaboration room",
  },
];

if (db.select().from(rooms).limit(1).all().length === 0) {
  db.insert(rooms).values(SEED_ROOMS).run();
}

export type { Room, Booking };

export function listRooms(): Room[] {
  return db.select().from(rooms).orderBy(asc(rooms.building), asc(rooms.roomName)).all();
}

export function listBookingsForRoomOnDate(roomId: number, date: string): Booking[] {
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.roomId, roomId), eq(bookings.date, date)))
    .orderBy(asc(bookings.startTime))
    .all();
}

export type NewBooking = {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  studentId: string;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: "invalid" | "conflict" };

// The one place double-booking is prevented: two bookings for the same room
// and date conflict unless one ends at or before the other starts. Checked
// here (not just relied on client-side) so a raced or scripted request can't
// slip a conflicting booking past the UI.
export function createBooking(input: NewBooking): CreateBookingResult {
  if (input.startTime >= input.endTime) return { ok: false, error: "invalid" };

  const existing = listBookingsForRoomOnDate(input.roomId, input.date);
  const conflicts = existing.some(
    (booking) => input.startTime < booking.endTime && input.endTime > booking.startTime,
  );
  if (conflicts) return { ok: false, error: "conflict" };

  const booking = db.insert(bookings).values(input).returning().get();
  return { ok: true, booking };
}

export type BookingWithRoom = Booking & { room: Room };

export function listBookingsForStudent(studentId: string): BookingWithRoom[] {
  const studentBookings = db
    .select()
    .from(bookings)
    .where(eq(bookings.studentId, studentId))
    .orderBy(asc(bookings.date), asc(bookings.startTime))
    .all();

  const roomsById = new Map(listRooms().map((room) => [room.id, room]));
  return studentBookings.map((booking) => ({
    ...booking,
    room: roomsById.get(booking.roomId) as Room,
  }));
}

export type CancelResult = { ok: true } | { ok: false; error: "not_found" };

// Ownership without a login: only deletes when the posted Student ID matches
// the booking's own, so cancelling requires knowing the ID it was booked
// under, not just the booking's id.
export function cancelBooking(id: number, studentId: string): CancelResult {
  const result = db
    .delete(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.studentId, studentId)))
    .run();
  return result.changes > 0 ? { ok: true } : { ok: false, error: "not_found" };
}
