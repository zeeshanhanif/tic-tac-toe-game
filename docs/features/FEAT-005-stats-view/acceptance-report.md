# Acceptance Report: FEAT-005 — Statistics & History view

> Verdict: **Accepted** · Date: 2026-08-09
> Re-verification (DEF-005): **Accepted (holds)** · Date: 2026-08-20
> Re-verification (DEF-006): **Accepted (holds)** · Date: 2026-08-23
> Re-verification (DEF-009, DEF-010): **Accepted (holds)** · Date: 2026-11-16 — *design artifacts pending (DEF-009)*

## DEF-009 + DEF-010 re-verification — 2026-11-16 (Accepted, holds)

> Repo state audited: `dacc484` + the AC-2 test added in this run · Fixes under
> audit: `12ab5d2` (DEF-009), `9b32630` (DEF-010)

**DEF-009:** the Stats back button was hard-coded to "‹ Back to game", but Setup
also opens Stats, where Back returns to Setup and no game exists. **AC-4**
(FR-UI-002) covers only Game → Stats → Back and still holds. The Setup entry
point comes from ux-foundations, not from this feature's criteria, so the
criteria never constrained that label. That is a coverage gap in the standard,
now closed by a regression test.

**DEF-010:** `summarize` added `vsComputer.easy/medium/hard` by name instead of
folding over `DIFFICULTIES`. With today's three levels **AC-1/AC-5** (summary
counts per filter) were and are correct. The defect was latent: a new level
would have been silently left out of the Vs. Computer and All totals.

- **Fixes audited:** `StatsViewHandlers.backLabel` is required (not defaulted),
  and the shell passes "‹ Back to game" from Game and "‹ Back to menu" from
  Setup. `summarize` reduces over `DIFFICULTIES` from `emptyWLD()`.
- **Test audit:**
  - `review-stats.spec.ts` › "from Setup, Back is labelled for the menu and
    returns there (DEF-009)" asserts no "Back to game" button exists, then
    clicks the exact "‹ Back to menu" button and lands on Setup. The existing
    CF-2 test still asserts the Game-origin label and the preserved game (AC-4).
  - `stats.difficulty-drift.test.ts` mocks `DIFFICULTIES` with an extra level,
    pins the premise (the bucket exists and holds 1), then asserts both the
    Vs. Computer and All totals count it. It sits in its own file because
    `vi.mock` is module-wide. Faithful to the single-source contract `core/ai.ts`
    documents.
- **Test added by this audit (AC-2):** no test asserted that a vs-Computer
  history entry *shows its difficulty* (AC-2: "mode (+ difficulty for
  vs-Computer)"). Every history assertion used 2-player games. That line also
  changed under DEF-011, so it was unguarded twice over.
  `review-stats.spec.ts` › "a vs-Computer history entry shows its difficulty
  (AC-2)" plays the deterministic Hard line (X 0,1,3 → O wins on 6) and asserts
  the row reads "Vs. Computer" / "Hard AI" with a Loss badge. Mutation-checked:
  changing the subtitle text turns it red.
- **Mutation checks (this run):** reverting only the production change of each
  fix turns its guard red (DEF-009: `stats.ts` + `shell.ts`; DEF-010:
  `core/stats.ts`).
- **Feature criteria re-checked:** CF-2 (summary, history, filter, back), the
  empty state, the FEAT-006 reset flow, and both DEF-006 freshness tests run
  green.
- **Independent execution (this run):** ESLint clean · **74 unit** · **25 E2E** ·
  `tsc` + Vite build clean.
- **Design artifacts pending (DEF-009):** ux-foundations (nav model: "Back to
  game" on Stats) and this feature's ui-design describe only the Game-origin
  label. They should record the Setup-origin "‹ Back to menu". Not edited here:
  they belong to ux-foundations / ui-design.
- **Verdict:** **Accepted (holds)**. DEF-009 → **Fixed (design artifacts
  pending)**; DEF-010 → **Fixed**. RTM unchanged.

## DEF-006 re-verification — 2026-08-23 (Accepted, holds)

> Repo state audited: `5ca6af2` · Fix under audit: `95ed648` + `5ca6af2`

**DEF-006:** navigating Game → Stats left the pending 400 ms AI timer running on
the *detached* game view. It fired, the AI finished the game, and
`recordIfEnded()` wrote to the shared store **after** `createStatsView` had
already taken its snapshot — so the tiles and history rendered one game behind.
This was a latent gap in **AC-1/AC-2** (FR-STATS-003/004): the criteria check
that the view renders the *stats it read*, never that what it read is still true
by the time it paints.

- **Fix audited:** `createGameView` returns `GameView { element, pause, resume }`;
  the shell pauses on the way into Stats and resumes on return. Every lifecycle
  exit now pauses. No change to FEAT-005's own rendering, filtering, or reset
  paths — the store it reads is simply no longer mutated behind it.
- **Failing test first:** red with the exact defect signature — *Stats view shows
  {wins:0,losses:0,draws:0} but storage holds {wins:0,losses:1,draws:0,
  history:1}*.
- **Both halves mutation-checked**, which mattered: removing `pause` reproduces
  the defect; removing `resume` **freezes the game** (the AI never takes its
  deferred turn). A fix that only cancelled would have traded a display bug for
  an unplayable game.
- **Two earlier candidates rejected on evidence**, both recorded in the ledger:
  *re-read on render* does not fix it (nothing triggers a re-render after the
  background write — it would have shipped as a no-op that looked like a fix),
  and *cancel without resume* is the frozen-game case above.
- **Feature criteria re-checked:** CF-2 (stats reflect a played game, filter,
  back), the empty-state case, and the FEAT-006 reset flow all re-run green.
- **Contract change:** `createGameView`'s return type changed from `HTMLElement`
  to `GameView`. No design document specifies that signature, and ADR-003
  ("keep timers … in the shell") is satisfied — the timer stays in the `ui/`
  layer, now under explicit shell control. **No design amendment required.**
- **Trade-off carried, not hidden:** the deferred AI move restarts its 400 ms
  delay on every Stats round trip, and a user bouncing in and out can defer it
  indefinitely. No requirement constrains when the AI move lands relative to
  navigation, so this conforms — recorded in the ledger and surfaced to the
  owner as a UX judgement rather than settled here.
- **Independent execution (this run):** ESLint clean · **71 unit** · **19 E2E** ·
  `tsc` + Vite build clean.
- **Verdict:** **Accepted (holds)** — FEAT-005's criteria are unaffected and the
  staleness that breached FR-STATS-003 is closed and guarded. DEF-006 →
  **Fixed**. RTM unchanged.
> Standard: technical-design.md §6 (6 criteria) · Sources: srs.md, use-cases.md, architecture.md (ADR-006 / CF-2)
> Repo state audited: HEAD (00a3160) — FEAT-005 fully committed

## DEF-005 re-verification — 2026-08-20 (Accepted, holds)

> Repo state audited: `49bc57c` · Fix under audit: `576bbf6`

Scoped to this feature's share of **DEF-005**: the footer "View stats & history"
link — FEAT-005's primary entry point to the Stats view on both Setup and Game —
measured **29 px** tall, under the 44 px floor NFR-USE-002 requires and design.md
§9 rule 4 applies to every control.

- **Fix audited:** `min-height: var(--layout-touchTargetMin)` plus flex centering
  on `.footer .link`, with the underline moved from `border-bottom` to
  `text-decoration` so it keeps hugging the text rather than sinking to the
  bottom of the taller box. Markup untouched (`setup.ts` / `game.ts` unchanged) —
  so none of FEAT-005's own criteria change behaviour.
- **Failing test first:** red at 29 px before the fix; green at 44 px after.
- **Feature criteria re-checked:** the CF-2 E2E flow (stats reflect a played
  game, filter, back) and the empty-state case re-run green — the link's box
  changed, its role/name/handler did not.
- **Systemic note:** NFR-USE-002 was verified once, in **FEAT-001's AC-16**,
  when only FEAT-001's controls existed. FEAT-005 added a control afterwards and
  no criterion re-checked the cross-cutting NFR — which is how a 29 px target
  shipped through acceptance. The new `touch-targets.spec.ts` now covers this
  NFR across screens rather than per-feature, closing the class of gap rather
  than this instance.
- **Verdict:** **Accepted (holds)** — no behaviour change to FEAT-005's criteria;
  the NFR breach it carried is closed and guarded. RTM unchanged.

## Verdict summary

FEAT-005 is **accepted** — verified. The standard (W/L/D summary, chronological
history, mode filter, game↔stats navigation) was re-derived from FR-STATS-003/004
+ FR-UI-002 + UC-06 and faithfully encoded. The pure aggregation is unit-tested
and a mutation check confirms the filter test bites; the view, filter, empty
state, and game-preserving navigation were verified first-hand in a real browser
and are guarded by the new **CF-2 E2E smoke**. No rework or design-defect
findings; two non-blocking minors.

## Audit table

| AC | Encodes | Test(s) / evidence | Audit | Observed |
| :- | :------ | :----------------- | :---- | :------- |
| AC-1 | FR-STATS-003, UC-06 | stats.test summarize (per filter); **browser** tiles 1/0/1; CF-2 E2E | faithful (mutation-checked) | green |
| AC-2 | FR-STATS-004, UC-06 | stats.test filterHistory newest-first; **browser** 2 rows; CF-2 E2E | faithful | green |
| AC-3 | UC-06 2a (empty) | stats.test empty→0/[]; **browser** "No games yet"; CF-2 empty E2E | faithful | green |
| AC-4 | FR-UI-002 | **browser**: View stats → Back preserves the draw game; CF-2 E2E back | observed | green |
| AC-5 | FR-STATS-003/004 filter | stats.test per-filter; **browser** Vs.Computer→empty; CF-2 E2E filter | faithful (mutation-checked) | green |
| AC-6 | FR-STATS-005 read | **browser**: tiles/history reflect the persisted store | observed | green |

## Corrected tests

None — no weakening in the FEAT-005 diff; all faithful on first read.

## Independent execution

Fresh from HEAD with the project's own commands:
- `npm test` → **53 passed (6 files)**.
- **Mutation check (AC-1/AC-5):** made `summarize` ignore the two-player filter
  (return the "all" aggregate) → the "filters to two-player" test **failed**;
  restored → **53 passed**. The filter aggregation is genuinely verified.
- `npm run test:e2e` → **8 passed** — CF-1 (5), the new **CF-2 review-statistics
  (2)**, and the DEF-001 setup guard (1).
- `npm run lint` → clean, incl. ADR-003 boundaries (aggregation pure in `core`,
  view in `ui` reading the infra store).

## Direct verification

- **Stats view (AC-1/2/6), in-browser:** after two 2-player games (a win + a
  draw) the view showed "2 games played · 50% win rate", tiles Wins 1 / Losses 0
  / Draws 1, and two newest-first history rows with correct result badges — all
  read from the persisted store.
- **Filter + empty (AC-5/AC-3):** switching to Vs. Computer showed 0/0/0 tiles,
  "No games yet", and "Play a game to see it here."
- **Navigation (AC-4):** "View stats & history" (from the game footer) opened the
  screen; **Back to game returned to the preserved draw game** (D1), not a fresh
  one. Zero console errors.
- **Screen vs. manifest:** SCR-WEB-004 renders per the registered source
  (stat-tiles, result-badges, history list, back pill); tokens, not raw values
  (style.css clean). Reset control correctly absent (FEAT-006).
- **Contract:** `summarize`/`filterHistory` + `statsStore.snapshot()` match
  technical-design §3.

## Findings

**Rework:** none. **Design defect:** none.

**Minor (non-blocking):**
1. **Reset not on the screen yet** — by design: the reset control + confirm
   dialog (SCR-WEB-005) is FEAT-006. Recorded as a manifest gap on SCR-WEB-004,
   not a defect. The CF-2 E2E covers review; FEAT-006 extends it with reset.
2. **Result perspective (FEAT-004 D2)** — 2-player rows read from Player 1 (X)'s
   view; the history labels ("2 Players / Local match") don't expose per-player
   W/L, consistent with that convention. Acceptable for v1.

## RTM

Accepted → **Test ref appended** with `features/FEAT-005-stats-view/acceptance-report.md`
for FR-STATS-003, FR-STATS-004, and FR-UI-002.
