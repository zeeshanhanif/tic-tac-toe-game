# Acceptance Report: FEAT-003 — Hard AI (minimax)

> Verdict: **Accepted** · Date: 2026-08-08
> Standard: technical-design.md §6 (7 criteria) · Sources: srs.md, use-cases.md,
> architecture.md (ADR-006 / CF-1)
> Repo state audited: HEAD (56a0646) — FEAT-003 fully committed

## Verdict summary

FEAT-003 is **accepted** — verified. The standard (optimal, never-losing minimax
within 500 ms) was re-derived from FR-AI-003 + NFR-PERF-002 and found faithfully
encoded. The headline criterion — **never loses** — is proven by an *exhaustive*
self-play test over every opponent line (as X and O), and a mutation check
confirmed that test genuinely bites: a dumb first-legal AI fails it. All 27 unit
tests and 6 CF-1 E2E tests pass, incl. the new Hard-game smoke. No rework or
design-defect findings; two non-blocking minors. (A pre-existing FEAT-002 defect,
**DEF-001**, was found and fixed during this work — noted below.)

## Audit table

| AC | Encodes | Test(s) / evidence | Audit | Observed |
| :- | :------ | :----------------- | :---- | :------- |
| AC-1 | FR-AI-003 (optimal) | ai.test "takes the immediate win over a slower line" | faithful | green |
| AC-2 | FR-AI-003 (**never loses**) | ai.test exhaustive self-play, AI as X and O | faithful (mutation-checked) | green |
| AC-3 | FR-AI-003 (win) | ai.test "takes an immediately winning move" | faithful | green |
| AC-4 | FR-AI-003 (block) | ai.test "blocks the opponent's immediate win" | faithful | green |
| AC-5 | NFR-PERF-002 (<500ms) | ai.test timed first-move | faithful (indicative) | green |
| AC-6 | FR-MODE-002 (completes) | browser + E2E: Hard selectable, Hard game plays | observed | green |
| AC-7 | FR-AI-005 (legal) | ai.test "Hard returns only legal cells" | faithful | green |

## Corrected tests

None. The obsolete `"Hard throws until FEAT-003"` test was **removed** (it
asserted the stub's throw, which this feature intentionally replaces) and
superseded by stronger never-lose/tactics tests — a faithful update to changed
behavior, not a weakening. Confirmed in the FEAT-003 test diff.

## Independent execution

Fresh from HEAD with the project's own commands:
- `npm test` → **27 passed (3 files)**.
- **Mutation check (AC-2):** replaced minimax with a first-legal move → the two
  never-lose tests **failed** (the exhaustive search found beating lines);
  restored → **27 passed**. The never-lose guarantee is genuinely verified, not
  vacuous.
- `npm run test:e2e` → **6 passed** (CF-1 incl. the Hard smoke + the DEF-001
  regression guard); rebuilds the bundle first.
- `npm run lint` → clean (ADR-003 boundaries incl.). Build green (via E2E
  pretest).
- No migrations (client-only).

## Direct verification

- **Never-lose (AC-2):** exhaustive — every opponent continuation explored; the
  AI's result is always win or draw. Strongest possible evidence for FR-AI-003.
- **Performance (AC-5):** the worst-case (empty-board) move is computed in well
  under 500 ms (NFR-PERF-002) — timed in-test; indicative on this machine.
- **Hard selectable (AC-6):** verified in-browser (Setup shows Easy/Medium/Hard
  all selectable; Hard note "plays perfectly — the best you can do is draw") and
  by the CF-1 Hard E2E smoke (a full Hard game where the human never wins).
- **Screens vs. manifest:** SCR-WEB-001 updated (Hard enabled, source-conformant);
  SCR-WEB-002 reused. Tokens, not raw values (style.css clean).
- **Contract:** `chooseMove(…, "hard")` matches technical-design §3; deterministic.

## Findings

**Rework:** none. **Design defect:** none.

**Minor (non-blocking):**
1. **AC-5 perf is machine-indicative** — timed against the local run, not
   instrumented across target devices (NFR-PERF-002). Comfortably under budget;
   the 3×3 tree is tiny (architecture §11).
2. **Plan imprecision** — the plan lists FR-MODE-002 fully under FEAT-002 and
   SCR-WEB-002 as FEAT-003's screen; in reality FEAT-003 completes FR-MODE-002 and
   the visible change is on SCR-WEB-001. A future planning touch could align the
   Plan ref; does not affect this verdict.

**Related (out of scope for this verdict):** **DEF-001** — a pre-existing FEAT-002
cosmetic bug (two-player showed the vs-Computer controls) was found during this
work and fixed as its own commit (`e0d6f2e`) with a mutation-verified E2E guard
(`tests/e2e/setup.spec.ts`) and a ledger entry (`docs/defects.md`). Per the
user's lightweight routing choice, FEAT-002 was not formally re-verified; the
regression guard covers it.

## RTM

Accepted → **Test ref appended** with `features/FEAT-003-hard-ai-minimax/acceptance-report.md`
for FR-AI-003, and appended to FR-MODE-002 (which — with FEAT-002's partial +
FEAT-003's completing report — is now fully verified).

---

## Re-verification — 2026-08-09 (DEF-002)

> Verdict: **Accepted** (unchanged) · Trigger: DEF-002 (CI perf failure) fix

CI (`Run npm test`) failed AC-5 on GitHub's runner (931 ms > 500 ms) — the
machine-indicative risk this report flagged. Fix: **memoize minimax** by
(board, to-move) within each `chooseMove` (`fix(DEF-002)`, commit `ff2131a`).

Re-audited from the fixed HEAD:
- `npm test` → **53 passed**, incl. the perf test (empty-board Hard move now
  ~14 ms cold vs 931 ms — ~35× margin under 500 ms).
- **Never-lose still holds:** the exhaustive self-play tests pass, and the
  mutation check still bites (a first-legal AI fails them). Memoization returns
  identical optimal moves (board determines depth → cache-correct), so the
  never-lose guarantee and tactics (AC-1/2/3/4/7) are unchanged.
- Verdict remains **Accepted**; AC-5's minor caveat is resolved (perf is now
  hardware-robust, not just locally indicative).
