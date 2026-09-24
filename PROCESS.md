# Process overview

## What I built

**ANU RoomFlow** — a full-stack replacement for a small slice of the ANU room-booking experience, covering room browsing, booking creation, double-booking prevention, viewing bookings by Student ID, and cancellation. It uses the course default stack: Astro, Drizzle and SQLite, and is deployed to Fly.io.

The project deliberately focuses on one complete booking lifecycle rather than trying to recreate an entire university booking platform. That kept the work aligned with the Crit 7 requirements: a real ANU system slice, persistent data, a complete end-to-end flow, and a visible development process.

## How I got here

I started by asking the agent to inspect the existing dynamic starter before changing anything. The starter was built around a guestbook example, so the first question was not how to add RoomFlow on top of it, but which parts of the guestbook were only there to demonstrate the platform and could be removed.

From there, I gave the agent a clear scope up front: browse rooms, create bookings, persist them, prevent overlapping bookings, view bookings using Student ID, and cancel them. I also made one process rule explicit: the work had to be built in stages, and after each stage the agent had to report what changed, which Crit 7 requirement it addressed, what checks passed, and what the corresponding Git commit should be.

That process rule is what produced a repository history that shows the application growing one capability at a time.

**Stage 1** —
[`6a963b5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/6a963b5) —
replaced the guestbook starter with the RoomFlow domain and room directory.

The main goal of this stage was to establish the data model and ANU-facing context before introducing state-changing behaviour. The guestbook structure was removed and replaced with room and booking concepts, and the home page became a directory of study spaces rather than a generic starter example.

This stage also forced an early scope decision: there would be no full login or session system. Instead, Student ID would act as a lightweight identifier for bookings. That kept the focus on the database-backed booking flow rather than authentication infrastructure.

**Stage 2** —
[`d5ac758`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/d5ac758) —
added booking creation, SQLite persistence and double-booking prevention.

This was the point where RoomFlow became genuinely full-stack. The booking form wrote through the application into the database, so a booking remained after a browser reload rather than existing only in client-side state.

I paid particular attention to the overlap logic because it was central to the booking system's credibility. The conflict check uses the standard interval rule:

`newStart < existingEnd && newEnd > existingStart`

so two bookings cannot overlap for the same room, even when the times are not identical.

This stage directly addressed the most important mechanical part of the Crit 7 spec: creating state that persists across reloads.

**Stage 3** —
[`c8690df`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/c8690df) —
added the My Bookings view and cancellation.

Students could now enter their Student ID, retrieve bookings associated with that ID, and cancel them. That completed the core booking lifecycle:

**browse → book → persist → view → cancel**

This stage also exposed one piece of earlier behaviour that had become outdated. During Stage 2, successful booking creation redirected back to `/`, because `/bookings/` did not yet exist. Once the bookings page was added, I reviewed the completed flow and changed the success redirect so it now leads to the bookings view.

That was a small correction, but it was a useful example of why I wanted the agent to report after every stage. It made it easier to notice when an earlier decision no longer matched the application that now existed.

**Stage 4** —
[`7afa6fb`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/7afa6fb) —
polished the RoomFlow content, styling and accessibility.

I deliberately left visual refinement until after the database-backed flow was complete. This stage improved the hierarchy, wording, responsive layout and interaction states so the application felt more like a real university service and less like a CRUD demo.

The important decision here was not to expand the feature set. Once the core Crit 7 flow worked, the goal was to improve clarity and usability without adding unnecessary systems such as authentication, profiles or advanced administration.

**Stage 5** —
[`aa6520c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/aa6520c) —
added `PROCESS.md` and the Crit 7 reflection.

At this point the application itself was already complete, so the focus moved to documenting how the work had been directed, grounded and corrected. I used the commit history as the backbone of the process account rather than reconstructing a cleaner story afterwards.

**Final revision** —
[`aa9cee6`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-congyuliu09/commit/aa9cee6) —
revised the Crit 7 reflection after reviewing the completed project.

The revision made the central lesson clearer: the project became manageable because I reduced the problem to one complete booking flow and kept each development stage small enough to verify before continuing.

## How I directed and corrected the work

The main way I directed the agent was by setting constraints before implementation.

I asked it to keep the existing Astro + Drizzle + SQLite stack, preserve the existing course infrastructure, avoid an external ANU API, and treat persistence as a first-class requirement rather than something to add later.

I also asked it to explain each stage before moving on rather than generating a large final implementation. That mattered because the most useful corrections were not necessarily syntax errors. They were cases where earlier behaviour no longer matched the evolving system, such as the booking success redirect after the My Bookings page was introduced.

The same process helped with scope control. A login system, sessions, user accounts and permissions would have made the system larger, but they were not necessary to demonstrate the Crit 7 material. Using Student ID instead kept the system believable while keeping the important path small enough to test completely.

## How I verified the result

The deployment path was tested before real feature work started. The untouched starter was deployed to the assigned Fly.io app first, proving that the token, build and DNS path were working independently of my own application changes.

After that, each stage was checked before the next one was committed. Type checking, build checks and the spec suite had to remain green as functionality was added.

The final application was also verified as an end-to-end flow rather than only as isolated code:

* rooms could be browsed
* a booking could be created
* the booking persisted across a reload
* conflicting bookings were rejected
* bookings could be retrieved using Student ID
* bookings could be cancelled
* the live application remained deployable at its `*.fly.dev` URL

By the end, the repository showed not only the final RoomFlow application, but also the path used to get there: scope first, then schema and domain, then persistence, then management, then polish, then documentation.
