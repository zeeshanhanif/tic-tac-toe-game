# Acceptance Report: FEAT-004 — Persistent stats recording

> Verdict: **Accepted** · Date: 2026-08-08
> Standard: technical-design.md §6 (6 criteria) · Sources: srs.md, architecture.md (ADR-004, §8)
> Repo state audited: HEAD (b814061) — FEAT-004 fully committed

## Verdict summary

FEAT-004 is **accepted** — verified. The standard (record W/L/D by mode +
difficulty, append match history, persist to `localStorage` at game end,
degrade gracefully) was re-derived from FR-STATS-001/002/005/007 + NFR-REL-002
and faithfully encoded. 18 new unit tests (core/stats, infra/storage,
infra/stats-store) pass; a mutation check confirms the graceful-save test bites
(a re-throwing `save` fails it). Persistence + once-only recording were verified
first-hand in a real browser via the `ttt:stats:v1` key (2→3 across a reload).
No rework or design-defect findings; two non-blocking minors.

## Audit table

| AC | Encodes | Test(s) / evidence | Audit | Observed |
| :- | :------ | :----------------- | :---- | :------- |
| AC-1 | FR-STATS-001 | stats.test: two-player + vs-computer[difficulty] buckets | faithful | green |
| AC-2 | FR-STATS-002 | stats.test: appends MatchRecord (mode/difficulty/result/timestamp) | faithful | green |
| AC-3 | FR-STATS-007 | stats-store.test: records once; **browser**: New Game no double-record | faithful | green |
| AC-4 | FR-STATS-005 | stats-store.test: restore across instances; **browser**: 2→3 across reload | faithful | green |
| AC-5 | NFR-REL-002 | storage.test: no-backend in-memory + no-throw on setItem fail | faithful (mutation-checked) | green |
| AC-6 | NFR-REL-001/§8 | storage.test corrupt→fallback; stats-store.test corrupt/version→empty | faithful | green |

## Corrected tests

None — all faithful on first read; no weakening patterns in the FEAT-004 diff.

## Independent execution

Fresh from HEAD with the project's own commands:
- `npm test` → **44 passed (6 files)**.
- **Mutation check (AC-5):** made `StorageRepo.save` re-throw → the "does not
  throw when setItem fails" test **failed**; restored → **44 passed**. The
  graceful-fallback guarantee is genuinely verified.
- `npm run test:e2e` → **6 passed** (CF-1 unaffected by the recording hook).
- `npm run lint` → clean — including the ADR-003 boundaries: `core/stats.ts` is
  pure (imports only core), `infra` imports core, `ui` imports infra. The
  Stats-Service-in-core / persistence-in-infra split (D1) holds under the rule.

## Direct verification

- **Persistence (AC-4), first-hand in-browser:** a 2-player win wrote
  `ttt:stats:v1` = `{ twoPlayer.wins:1, history:[{mode,result,timestamp}] }`; a
  second win → 2; after a **full page reload**, a fresh store instance restored
  the persisted 2 and a new game brought it to **3** (`history:3`). Zero console
  errors.
- **Once-only (AC-3):** New Game did not double-record; two games → exactly two
  history entries.
- **Graceful fallback (AC-5) / corrupt reset (AC-6):** unit + mutation verified
  (a real localStorage-disabled browser was not simulated; the injected-backend
  tests model it faithfully and are the authoritative evidence).
- **Contract:** `core/stats` (`recordResult`, `resultOf`, `emptyStatsState`),
  `infra/storage` (`createStorageRepo`), `infra/stats-store` (`createStatsStore`)
  match technical-design §3; persistence format (`ttt:stats:v1`, version 1)
  matches §4.

## Findings

**Rework:** none. **Design defect:** none.

**Minor (non-blocking):**
1. **No E2E for FEAT-004** — correct by design: the data has no user-visible
   surface until the stats view (FEAT-005 / CF-2), so there is nothing to smoke.
   Recording is unit + integration + in-browser-localStorage verified. The CF-2
   E2E lands with FEAT-005/006.
2. **Result perspective (D2)** — 2-player W/L/D is recorded from Player 1 (X)'s
   view (X-win = win). A documented convention; FEAT-005's stats view confirms
   the labeling. Not a defect.

## RTM

Accepted → **Test ref appended** with `features/FEAT-004-persistent-stats/acceptance-report.md`
for FR-STATS-001, FR-STATS-002, FR-STATS-005, FR-STATS-007, and NFR-REL-002.
