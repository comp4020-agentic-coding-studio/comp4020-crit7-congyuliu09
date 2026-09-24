# ANU RoomFlow

A simpler way to find and book study spaces at ANU. RoomFlow replaces the
usual scavenger hunt for a free room — browse study spaces across campus by
building, name and capacity, see what's already booked on a given day, and
book a slot with just a Student ID. No login, no institutional booking portal
account, no timetable clash-checking spreadsheet: pick a room, pick a time,
you're in. Bookings live in a real database and survive a reload, and you can
look yours up (and cancel one) later by re-entering the same Student ID.

## What good looks like here

Good, here, is a service that feels like it could actually replace the ANU
room-booking system a student deals with today: plain, predictable, and
honest about what it does and doesn't do. I decided against an account
system entirely — a Student ID typed into a form is enough friction to make
cancellation meaningful (only the ID that made a booking can cancel it)
without building real authentication for a one-week prototype. I decided
against any client-side JavaScript for the booking flow: every action is a
plain HTML form POST with a 303 redirect, which keeps the whole core flow
testable with bare `fetch()` calls and means the app degrades to nothing
fancier than a 2005-era web form — appropriate for a service whose only job
is "let me book a room," not a demo of interactivity.

What I chose not to build: recurring bookings, room search/filtering beyond a
date, editing an existing booking (cancel and rebook covers it), and any
admin view for managing rooms — RoomFlow seeds a fixed, realistic set of ANU
spaces (Hancock Library study rooms, a Marie Reay classroom, a Chifley
meeting room, a CSIT seminar room, a Kambri collaboration room) rather than
letting anyone create rooms, since "browse and book what's already there" is
the actual problem, not "manage a room inventory."

Enforced by `spec/` (see `spec/booking.test.ts`):

- a booking persists across a reload, checked via an independent second route
  (create it, then fetch `/bookings/` fresh and it's still there)
- two bookings can't overlap for the same room and time
- a booking can only be cancelled with the Student ID it was made under
- the seeded rooms show up with their real details (building, name, capacity)

Judged at the crit, not testable: whether this reads as a believable
replacement for ANU's actual room-booking experience rather than a generic
CRUD demo, and the account in `PROCESS.md` of how the work was directed,
grounded and corrected.

Images go in `public/` and are linked relatively — `![alt](public/before.png)`
— which renders on GitHub and at `/readme/` alike.
