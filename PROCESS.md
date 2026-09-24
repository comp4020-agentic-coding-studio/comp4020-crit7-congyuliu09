# Process overview

## What I built

**ANU RoomFlow** — a room-booking replacement covering browse, book,
double-booking prevention, view-by-Student-ID, and cancel, on the course's
default stack (Astro + Drizzle + SQLite, deployed to Fly.io). What it is and
what good means here is argued in full in `README.md`; this is how I got
there.

## How I got here

I opened by asking the agent to inspect the starter before proposing
anything — what the guestbook feature actually did (`messages` table, an SSE
bus, a spec test proving persistence and live updates), and what of that
carries over to a booking system versus what's just there to prove the
platform works. It correctly identified `spec/README.md`'s own line — the
guestbook "goes when the starter does" — as licence to remove it outright
rather than build RoomFlow alongside it.

I gave it a detailed feature brief up front (browse/book/persist/view/cancel/
no-double-booking, no external ANU API, Student ID instead of login, two
pages not one) and one explicit process rule: build in stages, report back
after each with what changed, what spec line it covers, what tests pass, and
what the commit is — no single end-of-week diff. That rule is the reason
this file has four real commits to cite instead of one.

**Stage 1** —
[`6a963b5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/6a963b5) —
replaced the `messages` schema with `rooms`/`bookings`, seeded six real ANU
spaces, rewrote `/` as a room directory. Before running `pnpm db:generate` it
hit a non-interactive-prompt failure (drizzle-kit couldn't tell "renamed
table" from "dropped one, added two" without a TTY to ask); the agent
resolved this itself by deleting the old migration history and generating a
fresh initial migration, reasoning that the deployed guestbook data wasn't
worth preserving. I checked that reasoning against what was actually
deployed (just the untouched starter) before accepting it.

**Stage 2** —
[`d5ac758`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/d5ac758) —
added `POST /api/bookings` with the overlap check
(`newStart < existingEnd && newEnd > existingStart`) and the booking form.
This is the stage I read most carefully, since silent double-booking would
have sunk the whole app's premise: I asked to see the conflict test directly
rather than take "tests pass" at face value, and confirmed it actually posts
two overlapping ranges rather than two identical ones (a much weaker test).

**Stage 3** —
[`c8690df`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/c8690df) —
added `/bookings/` and cancellation, scoped so only the Student ID that made
a booking can remove it. This stage also exposed a seam I'd approved without
noticing: Stage 2's success redirect went to `/` (since `/bookings/` didn't
exist yet), so finishing Stage 3 meant updating both the redirect target and
the now-stale test assertions from Stage 2 — a small but real instance of
"grounding" the agent's own earlier work against a spec line, not just new
code.

**Stage 4** —
[`7afa6fb`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/7afa6fb) —
README/CLAUDE.md rewritten for RoomFlow specifically, a small accessibility
pass (focus-visible outlines, a distinct cancel-button style), then deployed
with `flyctl deploy`. I verified the live app myself rather than trusting the
build: `curl`'d a real booking onto the deployed instance, confirmed it
showed up on a fresh `/bookings/?studentId=...` fetch, then cancelled it
through the live cancel endpoint to leave the seed data clean.

Throughout, `pnpm check` (typecheck + build + the full spec suite, including
the shipped invariants against every route) had to be green before any stage
was allowed to land — by the end, 40 tests across persistence, conflict
prevention, and view/cancel ownership.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
