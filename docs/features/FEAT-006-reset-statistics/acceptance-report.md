# Acceptance Report: FEAT-006 — Reset statistics

> Verdict: **Accepted** · Date: 2026-08-09
> Auditor: acceptance-verification (independent, standard re-derived from SRS /
> use-cases.md / technical-design §6 — not from tasks.md or the delivery summary)
> Implements: FR-STATS-006 (S), FR-UI-003 (S) · Realizes: UC-07

## Verdict summary

FEAT-006 is **accepted** — verified. The standard (an action to clear all stats
+ history behind an explicit confirmation step; confirm clears and shows zeroed
data; cancel changes nothing) was re-derived from the FR statements and UC-07,
then checked against the code, the tests, and direct observation. All **55 unit
tests** and **9 E2E tests** pass fresh from repo state; `tsc` build and ESLint
(module boundaries) are clean. **No rework or design-defect findings.** Three
non-blocking minors, one of which is the pre-filed E1 escalation.

**Rework:** none. **Design defect:** none.

## Standard cross-check (sources → criteria)

Every implemented FR is covered by a criterion, and every criterion is faithful
to its source; UC-07's alternate flow (3a cancel) is represented.

| FR / UC | Statement (abbrev.) | Criterion |
| :------ | :------------------ | :-------- |
| FR-STATS-006 | clear/reset all stats + history, with a confirmation step | AC-1, AC-3, AC-5 |
| FR-UI-003 | explicit confirmation before a destructive action | AC-2, AC-4, AC-6 |
| UC-07 main | reset → confirm → confirm → clear + show zeroed | AC-1/2/3 |
| UC-07 3a | cancel → no change | AC-4 |

No gap, no misencoding — nothing to route as a design defect.

## Criterion-by-criterion audit

| AC | Requirement | Test / observation | Assertion faithful? | Result |
| :- | :---------- | :----------------- | :------------------ | :----- |
| AC-1 | FR-STATS-006 / UC-07.1 — reset action present | `review-stats.spec` reset test clicks **Reset all statistics** | yes | green |
| AC-2 | FR-UI-003 / UC-07.2 — confirm **before** change | E2E: dialog visible **and** `.tile.win .num` still `1` before confirm | yes — asserts no early mutation | green |
| AC-3 | FR-STATS-006 / UC-07.3–4 — confirm clears → zeroed | `stats-store.test` (tallies+history → 0) **and** E2E (tiles `0/0/0` + empty history after confirm) | yes | green |
| AC-4 | UC-07 3a / FR-UI-003 — cancel is a no-op | E2E: **Cancel** and **Esc** both close with `.tile.win .num` still `1` | yes — both paths | green |
| AC-5 | FR-STATS-006 / NFR-REL-002 — reset persists | `stats-store.test`: fresh store over the same backend loads zeroed | yes | green |
| AC-6 | FR-UI-003 / a11y — focus-trap, Esc, label-not-colour | native `<dialog>.showModal()` (focus trap + modal ARIA); Esc observed in E2E; danger button labelled "Reset statistics" | yes (best-effort bar) | green |

- **Mutation sanity:** the AC-3 unit test asserts concrete zeroed WLD objects
  (`toEqual {0,0,0}`) and the E2E asserts exact tile text — a no-op `reset()`
  (leaving state untouched) would fail both. AC-2's "tile still 1 before confirm"
  would fail if the trigger cleared eagerly. The assertions bite.
- **Anti-fake-green (test diff `c1bc34c..HEAD`):** purely **additive** — two new
  unit tests, one new E2E test; **no existing test weakened, skipped, deleted, or
  mocked away.** Assertions are concrete, not proxies.

## Independent execution (this run, not reported claims)

- **Unit (vitest):** 6 files, **55 passed** (incl. the 2 new reset tests).
- **Build (`tsc && vite build`):** clean.
- **Lint (eslint, incl. ADR-003 boundary rules):** clean — `reset()` keeps the
  ui→infra→core direction; `confirm-dialog.ts` is `ui/` only.
- **E2E (playwright):** **9 passed**, incl. the CF-2 reset segment (dialog before
  change, cancel/Esc no-op, confirm→zeroed). CF-2 is now complete (review +
  reset).

## Direct requirement & conformance verification

- **FR-STATS-006 persistence (NFR-REL-002):** `reset()` writes
  `emptyStatsState()` through `repo.save(STATS_KEY, …)`; the in-memory fallback
  path also holds (Map-backed store), so a reset survives even without
  `localStorage`. Observed via the AC-5 unit test.
- **Design conformance (SCR-WEB-005 / SCR-WEB-004 supplement):** the new UI is
  token-driven — `confirm-dialog.ts` carries **no** raw values; `style.css`
  additions use `var(--…)` throughout. The **only** raw values are the two
  interim `--scrim` rgba declarations, which are the **pre-filed E1 escalation**
  (add a `--scrim` token), marked `TODO(E1)` — recorded debt routed to
  ux-foundations, **not** a silent fork. Manifest conformance
  (`pass-with-escalation`) is accurate.

## Minor, non-blocking observations

1. **AC-4 backdrop-cancel not E2E-covered.** The AC lists three cancel means
   (button / Esc / backdrop); the E2E exercises button and Esc directly. The
   backdrop path shares the same `close()` (code-verified via the
   `getBoundingClientRect` outside-click handler). No behavioural risk.
2. **AC-6 focus-trap is asserted by construction, not by a test** — it's a native
   `<dialog>.showModal()` guarantee; Esc-cancel is observed. Consistent with the
   best-effort a11y bar (NFR-A11Y-001, no formal WCAG commitment).
3. **E1 (`--scrim` token)** — carried escalation toward ux-foundations; interim
   ink-derived scrim in place. Does not affect this verdict.

## Traceability

Accepted → **Test ref appended** to the RTM for FR-STATS-006 and FR-UI-003 with
`features/FEAT-006-reset-statistics/acceptance-report.md`, closing each
requirement's Plan → Design → Test lifecycle.
</content>
