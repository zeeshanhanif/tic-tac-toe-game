# Acceptance Report: FEAT-005 — Statistics & History view

> Verdict: **Accepted** · Date: 2026-08-09
> Re-verification (DEF-005): **Accepted (holds)** · Date: 2026-08-20
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
