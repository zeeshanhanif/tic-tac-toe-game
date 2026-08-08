# Defect Ledger — Tic-Tac-Toe Game

Append-only record of defects (observed behavior violating an already-verified
requirement). Owned by the sdlc-orchestrator. Newest rows at the bottom.

| ID | Date | Owning FR / feature | Severity | Summary | Status |
| :- | :--- | :------------------ | :------- | :------ | :----- |
| DEF-001 | 2026-08-08 | FR-MODE-002/003 · FEAT-002 (setup) | Cosmetic | Two-player mode shows the vs-Computer-only Difficulty + "You play as" controls | Fixed |

---

## DEF-001 — Two-player shows vs-Computer controls

- **Observed:** On the Setup screen with **2 Players** selected, the Difficulty
  segmented control and the "You play as" side pills are visible. They are
  vs-Computer-only and should be hidden in two-player mode (FEAT-002 design /
  AC-1 "selecting Vs. Computer *reveals* the difficulty and side controls";
  ux-foundations SCR-WEB-001 "2-player hides them").
- **Discovered:** during FEAT-003 implementation (visual check of the Setup
  screen), 2026-08-08.
- **Owning feature:** FEAT-002 (setup view). The hide logic
  (`diffField.hidden = !vsComputer`) shipped in FEAT-002 but was only ever
  screenshotted in the vs-Computer state, so it slipped past acceptance.
- **Impact:** **Cosmetic only.** Functionally harmless — `onStart` includes
  `difficulty`/`humanMark` only for `mode === "vs-computer"`, so a two-player
  game already ignores them. No wrong game is started.
- **Root cause:** CSS specificity. `src/style.css` has `.field { display: flex }`,
  which overrides the user-agent rule `[hidden] { display: none }` (a class
  selector beats an attribute selector on the UA sheet). So setting the `hidden`
  attribute on a `.field` element has no visual effect.
- **Fix:** add `.field[hidden] { display: none }` to `src/style.css` so the
  `hidden` attribute wins for `.field` elements. (One line; no logic change —
  `setup.ts` already sets `hidden` correctly.)
- **Regression guard:** `tests/e2e/setup.spec.ts` — asserts two-player hides the
  Difficulty control and vs-Computer reveals it.
- **Verification:** fix applied, E2E green (setup.spec + CF-1), and confirmed by
  browser observation that two-player no longer shows the controls.
