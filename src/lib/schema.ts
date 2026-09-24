import { sql } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.
export const rooms = sqliteTable("rooms", {
  id: int().primaryKey({ autoIncrement: true }),
  building: text().notNull(),
  roomName: text("room_name").notNull(),
  capacity: int().notNull(),
  roomType: text("room_type").notNull(),
});

export const bookings = sqliteTable(
  "bookings",
  {
    id: int().primaryKey({ autoIncrement: true }),
    roomId: int("room_id")
      .notNull()
      .references(() => rooms.id),
    date: text().notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    studentId: text("student_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("bookings_room_date_idx").on(table.roomId, table.date)],
);

export type Room = typeof rooms.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
