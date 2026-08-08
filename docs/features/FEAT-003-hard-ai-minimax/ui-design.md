# UI Design: FEAT-003 — Hard AI (minimax)

> Feature from: docs/implementation-plan.md · Pairs with: technical-design.md
> Screens: SCR-WEB-001 (Hard enabled), SCR-WEB-002 (reused, unchanged) ·
> Mode: per-feature · Status: Draft · Date: 2026-08-08

Minimal presentation change — FEAT-003 is a **core/logic** slice. Both screens
are already registered; this run **updates SCR-WEB-001's entry** only. No new
components, no escalation.

## SCR-WEB-001 — Setup / New Game

- **Strategy & source:** registered — Claude Design `Setup Screen.dc.html` (entry
  owned by FEAT-001; vs-computer variant added by FEAT-002). This run enables the
  Hard option.
- **Composition** (design.md §4): unchanged — the Difficulty `segmented control`
  now has **all three options selectable** (Easy · Medium · Hard). This
  **restores the original source state** (the mockup always showed Hard
  selectable with the note "Hard plays perfectly — the best you can do is draw.");
  FEAT-002 had disabled Hard as a deliberate slice boundary (D3 there), now lifted.
- **Content & data mapping:** selecting Hard builds `GameConfig{ mode:"vs-computer",
  difficulty:"hard", humanMark }` → the existing Game view drives
  `core.chooseMove(board, aiMark, "hard")` (technical-design §3).
- **Conformance:** pass — the difficulty control now matches the source exactly
  (the FEAT-002 "Hard disabled" correction is retired).

### default
Difficulty control offers Easy / Medium / **Hard**, all selectable. The Hard note
reads "Hard plays perfectly — the best you can do is draw." (source copy). No
other state change.

## SCR-WEB-002 — Game — In Play

- **Strategy & source:** registered — reused **unchanged**. A Hard game renders
  through the same vs-Computer game screen (scoreboard "Computer / Hard AI", the
  computer-thinking state, auto-move) already designed in FEAT-002. No new states
  or bindings.

## Escalations & open items

- **None.** Enabling an already-designed control and reusing the game screen —
  no off-system elements, no new components. `remembered-defaults` (FEAT-008)
  remains the only open SCR-WEB-001 state.
