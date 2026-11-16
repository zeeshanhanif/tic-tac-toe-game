# Acceptance Report: FEAT-004 — Persistent stats recording

> Verdict: **Accepted** · Date: 2026-08-08
> Re-verification (DEF-003): **Accepted (holds)** · Date: 2026-08-11
> Re-verification (DEF-011): **Accepted (holds)** · Date: 2026-11-16
> Standard: technical-design.md §6 (6 criteria) · Sources: srs.md, architecture.md (ADR-004, §8)
> Repo state audited: HEAD (b814061) — FEAT-004 fully committed

## DEF-011 re-verification — 2026-11-16 (Accepted, holds)

> Repo state audited: `dacc484` · Fix under audit: `dacc484`

**DEF-011:** `isMatchRecord` treated `difficulty` as optional for every mode, and
`recordResult` defaulted a missing one to `"medium"`. A vs-Computer record
without a difficulty was accepted and silently counted under Medium.
**FR-STATS-002** requires the record to capture "difficulty (if applicable)",
and **FR-STATS-001** segments vs-Computer counts by it. The design's
`difficulty?` (technical-design §3 and AC-2) encodes "if applicable" as a
type-level optional, which is faithful. The defect was the code turning
"missing where required" into a guess instead of a rejection. **No design
amendment required.**

- **Fix audited:**
  - **AC-6:** the load guard rejects a vs-Computer entry with no difficulty, so
    such persisted state resets to defaults through the existing DEF-003 path.
  - **AC-1:** `recordResult` throws instead of choosing a bucket.
  - The Stats history row shows a neutral "AI" for the guard-unreachable case.
  - The only producer, the Game view, always supplies a difficulty in
    vs-Computer, so no live path throws.
- **Test audit (`core/stats.test.ts`):**
  - The guard test now also rejects `{mode:"vs-computer", result, timestamp}`;
    the well-formed cases (two-player without a difficulty, vs-computer with
    one) still pass.
  - A new `recordResult` test asserts the throw names the difficulty and that
    the input state is untouched (Medium bucket zero, history empty).
  - Two-player records are confirmed to still need no difficulty.
- **Mutation check (this run):** reverting only the production change in
  `core/stats.ts` turns the guard red.
- **Trade-off carried, not hidden:** stored history containing such an entry
  now resets the *whole* stats state on load. That is the DEF-003 policy for
  any malformed entry. The app never wrote such entries, so only tampered or
  externally corrupted data is affected. Recorded in the ledger.
- **Type tightening not taken:** making `MatchRecord` a union discriminated on
  `mode` would let the compiler enforce the rule. It was left out to keep the
  fix scoped and is recorded in the ledger as a cleanup candidate. Not a
  finding: the runtime guard is the NFR-REL-001 contract.
- **Feature criteria re-checked:** AC-1 to AC-6 unit and infra suites
  (`stats.test.ts`, `stats-store.test.ts`, `storage.test.ts`) run green.
  End-to-end, the vs-Computer record → Stats path is now also asserted by
  FEAT-005's new AC-2 test.
- **Independent execution (this run):** ESLint clean · **74 unit** · **25 E2E** ·
  `tsc` + Vite build clean.
- **Verdict:** **Accepted (holds)**. DEF-011 → **Fixed**. RTM unchanged.

## DEF-003 re-verification — 2026-08-11 (Accepted, holds)

Triggered by the per-feature review gate finding on `stats-store.ts` `loadState`.
**DEF-003:** the load guard checked only top-level truthiness, so a same-version
object with a **partial `stats` tree** (missing `vsComputer`) passed — later
crashing `recordResult`/`summarize`. This was a **latent gap in AC-6**
(NFR-REL-001 / architecture §8 "reset on corrupt shape"): the original AC-6
tests covered *total garbage* and *version mismatch*, but not *partial shape*.

- **Fix audited** (`fix(DEF-003)`, `0eee6e6`): a pure `isValidStatsState(x)`
  type-guard in `core/stats.ts` (validates version + `twoPlayer` and
  `vsComputer.{easy,medium,hard}` as WLD triples + `history` array); `loadState`
  resets to `emptyStatsState()` unless it passes — subsuming the old
  version+truthiness check. History *element* validation is out of DEF-003's
  scope (recorded).
- **Tests, failing-first:** the two `infra/stats-store.test.ts` DEF-003 cases
  were **observed red** before the fix (partial-corrupt not reset; vs-computer
  record threw), then green after. `core/stats.test.ts` adds 5 `isValidStatsState`
  cases. **No existing test weakened**; the original AC-6 cases (garbage, version
  mismatch) and AC-4 (persist & restore a real game — proving no over-rejection)
  still pass.
- **Review-gate completion (same day):** per `CLAUDE.md`'s quality gate, the
  DEF-003 fix diff was itself code-reviewed. The review found the guard validated
  the `history` *array* but not its *elements* — a malformed entry still passed
  and crashed `historyRow`'s `cap(r.result)` (the same corrupt-shape-crashes-a-
  consumer class, relocated to history). The fix was **completed**:
  `isValidStatsState` now validates every history entry as a `MatchRecord`
  (`isMatchRecord`), and the narrowing is sound. Failing-test-first again (the
  malformed-history case observed red, then green). Lower-severity review notes
  (#3 numeric-range, #4 hardcoded difficulties) recorded, not blocking.
- **Observed green this run:** FEAT-004 suite · whole repo **70 unit** · `tsc`
  build · ESLint (boundaries) · **12 E2E** — all fresh.
- **Verdict:** **AC-6 now fully covers corrupt-shape reset** (stats tree *and*
  history elements); FR-STATS-005 persistence and NFR-REL-001/002 hold. FEAT-004
  remains **Accepted**; RTM Test ref unchanged (already present). Defect ledger
  DEF-003 → **Fixed** (completed after review-gate).

---


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
