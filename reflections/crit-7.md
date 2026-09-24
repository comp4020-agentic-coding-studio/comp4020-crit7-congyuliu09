# Crit 7 reflection

**The breakthrough that moved the work forward** was deciding, before any
code, that there'd be no login — just a Student ID re-typed to view or
cancel a booking. It sounds like a small design call, but it's what made the
whole thing buildable in stages: no session middleware, no auth library, no
seams between "logged in" and "not," so every core action stayed a plain
form POST I could test with a bare `fetch()`. Once that was fixed, the
staged plan basically wrote itself — schema, then create, then view/cancel,
then polish — and each stage stayed small enough to actually finish and
commit on its own, instead of sprawling into "I'll just also add X while I'm
in here."

**What this changed about who I want to be as a developer** is how much I
now want a plan committed to paper (or chat) before the agent writes a line
of schema. Asking it to inspect the repo and propose the data model first,
rather than diving straight into feature code, is what surfaced the
guestbook-vs-RoomFlow scoping question early instead of as a mid-build
scramble. And insisting on a report after every stage — what changed, what
it tests, what the commit is — turned out to matter for more than just
`PROCESS.md`'s sake: it's the reason I caught the Stage 2→3 redirect drift
(a booking's success redirect pointed at `/` before `/bookings/` existed,
then had to be corrected once it did) instead of only finding it if
something broke later. I want that same discipline — plan, small stage,
verify, report, repeat — even on work I'm not asking an agent to help with.
