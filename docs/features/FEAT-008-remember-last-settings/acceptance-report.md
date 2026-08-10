# Acceptance Report: FEAT-008 — Remember last mode/difficulty

> Verdict: **Accepted** · Date: 2026-08-10
> Auditor: acceptance-verification (independent, standard re-derived from SRS /
> use-cases.md / technical-design §6 — not from tasks.md or the delivery summary)
> Implements: FR-MODE-005 (C) · Realizes: UC-01 (alt flow 2a)

## Verdict summary

FEAT-008 is **accepted** — verified. The standard (default the Setup screen to
the most recently used mode + difficulty; let the player accept and start
immediately) was re-derived from FR-MODE-005 and UC-01 2a, then checked against
the code, the tests, and the observed E2E behavior. **61 unit tests** and **12
E2E tests** pass fresh from repo state; `tsc` build and ESLint (module
boundaries) are clean. **No rework or design-defect findings.** One non-blocking
minor. **This is the plan's final feature — every FEAT is now verified.**

**Rework:** none. **Design defect:** none.

## Standard cross-check (sources → criteria)

| FR / UC | Statement (abbrev.) | Criterion |
| :------ | :------------------ | :-------- |
| FR-MODE-005 | remember last mode + difficulty, default on next launch | AC-1, AC-2, AC-3 |
| UC-01 2a | accept remembered settings and start immediately | AC-4 |

FR covered; UC-01's remembered-settings alternate path represented; criteria
faithful to the FR wording ("mode and difficulty" — side correctly excluded,
D2). Nothing to route as a design defect.

## Criterion-by-criterion audit

| AC | Requirement | Test / observation | Faithful? | Result |
| :- | :---------- | :----------------- | :-------- | :----- |
| AC-1 | FR-MODE-005 / UC-01 2a — defaults reflect last-used | `setup.spec` (FEAT-008): after starting vs-Computer/Hard then reload, `.mode.sel` = "Vs. Computer" and `.seg .on` = "Hard" | yes — asserts the exact restored selections | green |
| AC-2 | FR-MODE-005 — persist across reload | `last-settings.test` save→load round-trip **+** `setup.spec` `page.reload()` keeps the selections | yes | green |
| AC-3 | FR-MODE-005 / NFR-REL-002 — graceful fallback | `last-settings.test`: `parseLastSettings` → `null` for missing / non-object / unknown-enum (6 cases); the **no-saved-choice** branch is also observed live by the DEF-001 guard (fresh context defaults to two-player) | yes | green |
| AC-4 | UC-01 2a — accept + start immediately | `setup.spec`: after reload, pressing **Start Game** unchanged → a vs-Computer game showing "Computer" + "Hard AI" | yes | green |

- **Assertions bite:** AC-1 asserts the restored mode-card *and* the active
  difficulty segment by exact text — a broken seed (or persisting the wrong
  field) fails it. AC-3 asserts `null` across six malformed inputs, so a lax
  validator that passed corrupt data through would fail.
- **Anti-fake-green (FEAT-008 test diff):** **purely additive** —
  `last-settings.test.ts` (+46) and a new `setup.spec.ts` block (+25); **no
  existing test weakened, skipped, deleted, or mocked away** (verified: zero
  deletions in `setup.spec.ts`; the DEF-001 guard is untouched and still green).

## Independent execution (this run)

- **Unit (vitest):** 8 files, **61 passed** (incl. 3 new last-settings tests).
- **Build (`tsc && vite build`):** clean.
- **Lint (eslint, incl. ADR-003 boundaries):** clean — `ui/last-settings.ts`
  imports only `infra/storage.ts` + core types (ui→infra legal);
  `setup.ts`→`last-settings.ts` is ui→ui.
- **E2E (playwright):** **12 passed**, incl. the new remember-settings test and
  the unchanged CF-1/CF-2 + DEF-001 guard.

## Direct requirement & conformance verification

- **FR-MODE-005 "most recently used":** persistence fires on **Start** (D1), not
  on field change — verified in `setup.ts` (the `saveLastSettings` call sits in
  the Start handler). The E2E confirms a started game's settings are the ones
  restored.
- **Regression check:** seeding Setup from storage did **not** disturb the
  fresh-context default — the DEF-001 guard (two-player hides difficulty) still
  passes, confirming `parseLastSettings(null)` → built-in defaults.
- **Design conformance:** no new component, no new token; `last-settings.ts` and
  the `setup.ts` change carry **no raw values**; SCR-WEB-001's registered visuals
  are unchanged (only the initial selection differs). Manifest
  `remembered-defaults` state + closed gap are accurate.

## Minor, non-blocking observation

1. **AC-3's corrupt-data branch is unit-only.** The malformed-`localStorage` path
   is proven by `parseLastSettings` unit cases; the *no-saved* branch is also
   observed live (DEF-001 guard). An E2E seeding corrupt storage would exercise
   the corrupt branch end-to-end but is unnecessary for a Could feature — the
   pure validator is the correct test seam. Recorded, not blocking.

## Traceability

Accepted → **Test ref appended** to the RTM for FR-MODE-005 with
`features/FEAT-008-remember-last-settings/acceptance-report.md`, closing its
Plan → Design → Test lifecycle. **With this, every FR in the RTM is traced
plan → design → test.**
</content>
