# Acceptance Report: FEAT-002 — vs-Computer setup + Easy/Medium AI

> Verdict: **Accepted** · Date: 2026-08-07
> Standard: technical-design.md §6 (11 criteria) · Sources: srs.md, use-cases.md
> Repo state audited: HEAD (1f28988) — FEAT-002 fully committed (T1–T4 + design)

## Verdict summary

FEAT-002 is **accepted** — verified. The standard was re-derived from the SRS AI
and mode FR statements and UC-03; the criteria faithfully encode them (with
FR-MODE-002 correctly scoped partial — Hard deferred to FEAT-003 by design D3).
The 9 AI unit tests pass and were shown to catch regressions via a mutation
check (neutralizing Medium win/block turned all 4 AC-7 tests red; restore → 21
green). The vs-Computer UI — auto-move, Medium blocking, play-as-O AI-first,
input-lock — was verified by direct in-browser observation. No rework or
design-defect findings; three non-blocking minors.

## Audit table

| AC | Encodes | Test(s) / evidence | Audit | Observed |
| :- | :------ | :----------------- | :---- | :------- |
| AC-1 | FR-MODE-001, UC-01 | browser: Vs. Computer reveals controls, starts | observed | green |
| AC-2 | FR-MODE-002 (partial) | browser: Easy/Medium selectable, Hard disabled | observed | green |
| AC-3 | FR-MODE-003 | browser: X/O side pills | observed | green |
| AC-4 | FR-AI-004 | browser: AI auto-moves after ~400 ms delay | observed | green |
| AC-5 | FR-MODE-003 | browser: play-as-O → AI (X) opens first | observed | green |
| AC-6 | FR-AI-001 | ai.test Easy (RNG-pointed move + legality) | faithful | green |
| AC-7 | FR-AI-002 | ai.test Medium win / block / win-over-block / random | faithful (mutation-checked) | green |
| AC-8 | FR-AI-005 | ai.test legality loops (easy + medium) | faithful | green |
| AC-9 | FR-MODE-004 | browser: vs-Computer start uses difficulty + side | observed | green |
| AC-10 | NFR-REL-001 | browser: input-locked while thinking, no double-move, 0 console errors | observed | green |
| AC-11 | NFR-MAINT-002 | 9 Vitest tests over chooseMove | faithful | green |

## Corrected tests

None — every test audited faithful to its criterion on first read.

## Independent execution

Fresh from HEAD with the project's own commands:
- `npm test` → **21 passed (3 files)**.
- **Mutation check**: replaced the Medium win/block branch with a wrong-but-
  deterministic move → **4 failed** (all AC-7 tests: win, block, win-over-block,
  random-fallback); restored → **21 passed**. Confirms the Medium tests fail when
  they should.
- `npm run lint` → clean (ADR-003 module-boundary rules included).
- `npm run build` (`tsc && vite build`) → green.
- No migrations (client-only). No E2E owed (architecture names no critical flow).

## Direct verification

- **AI behavior (browser):** Medium **blocked** a human two-in-a-row threat
  (X at 0,3 → AI O at 6); Easy played legally; the AI **auto-moved** after a
  visible delay; **play-as-O** made the AI (X) open first. Two-player path
  regression-clean (no AI moves; "Player 1/2" labels).
- **NFR-REL-001 (AC-10):** board input-locked during "Computer is thinking…";
  no double-move; zero console errors across the session.
- **Screens vs. manifest:** SCR-WEB-001 vs-Computer variant (difficulty + side,
  Hard disabled) and SCR-WEB-002 computer-thinking state + "You/Computer <Diff>
  AI" scoreboard rendered as specified. Token purity holds (no raw hex in
  `style.css`).
- **Contract:** `chooseMove(board, mark, difficulty, rng?)` and the extended
  `GameConfig` match technical-design §3–§4; no divergence.

## Findings

**Rework:** none. **Design defect:** none.

**Minor (non-blocking):**
1. **FR-MODE-002 is delivered partially** (Easy/Medium selectable; Hard disabled)
   — a documented slice boundary (design D3); FEAT-003 completes it by enabling
   Hard. Recorded, not a defect. Test ref carries `(partial)`.
2. **UI/orchestration ACs (AC-1/3/4/5/9/10) verified by browser observation** —
   no automated UI regression test, consistent with the design's core-only test
   strategy (ADR-005). The parked Playwright/jsdom decision would close this.
3. **AC-4 delay (~400 ms) and AC-10 input-lock** verified by observation, not an
   automated timing assertion (UI timers).

## RTM

Accepted → **Test ref appended** with `features/FEAT-002-vs-computer-easy-medium/acceptance-report.md`
for FR-AI-001/002/004/005 and FR-MODE-003; `(partial)` for FR-MODE-002; and
appended to FR-MODE-001 / FR-MODE-004 — which, now that both FEAT-001 and
FEAT-002 have accepted reports, are **fully verified** (computed).
