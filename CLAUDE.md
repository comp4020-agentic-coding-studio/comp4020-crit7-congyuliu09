# Your harness

This file is yours, and it arrives empty on purpose. The rules you hold the
agent to are part of what gets marked, so they should be rules you decided on.

Nothing about the starter is recorded here. What the repo ships is explained
where it lives --- `fly.toml`, the `Dockerfile`, the CI workflow and
`spec/README.md` each say what they fix --- and the
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec. Read them before you plan or build;
what the agent needs to carry from any of it is your call.

## Rules for this repo

- **No client-side JavaScript for the core flow.** Booking, viewing and
  cancelling are all plain `<form>` POSTs with a 303 redirect. If a feature
  needs client JS to work at all, that's a sign it doesn't belong in this
  prototype's scope.
- **Never trust client-side validation alone.** Every check that matters
  (required fields, start-before-end, double-booking) is enforced again on
  the server in `src/lib/db.ts`, because a `fetch()` in a spec test — or a
  browser with JS disabled — skips whatever the HTML form only suggests.
- **No login, no sessions, no cookies.** Identity is a Student ID the visitor
  re-types to view or cancel their bookings. Don't reach for auth machinery
  to make this "more correct" — the point is a booking system as simple as a
  library sign-up sheet, not an account system.
- **Build and commit in stages, not one giant diff.** Each stage lands only
  once `pnpm check` is green, and gets its own commit before the next stage
  starts. A stage that isn't green doesn't get committed, and a stage isn't
  "done" until it's reported back with what changed, what it tests, and what
  the commit is.
- **Don't touch `mise.local.toml`.** It holds the live `FLY_API_TOKEN` and
  must never be staged or committed — check `git status` before every
  commit, not just before the first one.
- **Don't invent ANU rooms or buildings that don't sound real.** Seeded rooms
  use real ANU building names (Hancock, Chifley, Marie Reay, CSIT, Kambri) so
  the app reads as a plausible replacement, not a generic demo with
  placeholder data.
