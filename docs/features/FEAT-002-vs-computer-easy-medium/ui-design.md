# UI Design: FEAT-002 — vs-Computer setup + Easy/Medium AI

> Feature from: docs/implementation-plan.md · Pairs with: technical-design.md
> Screens: SCR-WEB-001 (vs-Computer variant), SCR-WEB-002 (computer-thinking) ·
> Mode: per-feature · Status: Draft · Date: 2026-08-07

Both screens were **registered against the Claude Design source in FEAT-001**;
this run **updates their existing manifest entries** (states + bindings grow —
no duplication). The vs-Computer Setup state and the vs-Computer scoreboard are
source-backed (already in the mockups); the "computer-thinking" turn state is a
code-native supplement (absent from the source). No design-system amendment —
every element composes from existing components.

## SCR-WEB-001 — Setup / New Game

- **Strategy & source:** registered — Claude Design `Setup Screen.dc.html`
  (entry owned by FEAT-001). This section adds the **vs-Computer** state.
- **Composition** (design.md §4): the same screen as FEAT-001's 2-player variant,
  now with the vs-Computer path live: selecting the **Vs. Computer** `mode-card`
  reveals two more fields below Mode — a **Difficulty** `segmented control`
  (Easy · Medium · Hard) and a **"You play as"** `play-as-pill` pair (X · goes
  first / O · goes second). Start `btn.primary`.
- **Content & data mapping:** builds `GameConfig{ mode:"vs-computer", difficulty,
  humanMark }` → `core.newGame` on Start (technical-design §3–§4).
- **Conformance:** pass. Corrections: **Hard is present but disabled** ("Hard —
  FEAT-003") — the minimax that makes it playable is FR-AI-003/FEAT-003 (D3);
  small-text `--color-mutedStrong` + focus rings as system-wide.

### vs-computer (this feature's state)
Vs. Computer `mode-card` selectable; when selected, Difficulty + "You play as"
appear (they stay hidden for 2 Players — FEAT-001). Difficulty defaults to
**Medium**, side defaults to **X (goes first)**. Easy/Medium + either side start
a game; **Hard is disabled** (greyed, non-selectable). The `remembered-defaults`
state remains deferred to FEAT-008.

- **Decisions:** *Hard disabled this slice* (D3, technical-design §7) — keeps the
  difficulty control complete-looking while never starting an unplayable Hard
  game before FEAT-003.

## SCR-WEB-002 — Game — In Play

- **Strategy & source:** registered — Claude Design `Game Screen.dc.html` (entry
  owned by FEAT-001). This section adds the **computer-thinking** state and the
  **vs-Computer scoreboard**.
- **Composition** (design.md §4): the FEAT-001 game layout; in vs-Computer mode
  the two scoreboard `card`s read **"You"** (human's mark) and **"Computer"**
  with a difficulty sub ("Medium AI") — this is the source screen's native
  labeling (the 2-player "Player 1/2" labels were the FEAT-001 variant). The
  `turn indicator` gains a thinking variant.
- **Content & data mapping:** board ← `GameState.board`; on the AI's turn the
  view calls `core.chooseMove(board, aiMark, difficulty)` → `playMove`
  (technical-design §3, §5); `aiMark = other(humanMark)`.
- **Conformance:** pass. The thinking state composes the existing turn-indicator
  component (pulse + text) — no new component, no escalation.

### computer-thinking (code-native supplement — not in source)
While the AI's move is pending (the ~400 ms delay, FR-AI-004), the turn
indicator reads **"Computer is thinking…"** with the pulse tinted to the AI's
mark; the board is **input-locked** (cells not `playable`, clicks ignored —
NFR-REL-001). Reverts to the normal turn indicator once the AI has moved (or the
game ends → result banner, SCR-WEB-003 from FEAT-001).

- **Decisions:** *thinking state reuses the turn-indicator* with variant copy
  rather than a new component — conform-not-fork.

## Cross-screen decisions

- **vs-Computer vs. 2-player labeling** is resolved by `GameConfig.mode`: mode
  drives both the Setup controls shown and the Game scoreboard labels — one
  config switch, no duplicated screens.

## Escalations & open items

- **None.** vs-Computer Setup + scoreboard are source-backed; the thinking state
  and Hard-disabled treatment are content variants / state gating of existing
  components. Deferred: Hard difficulty (FEAT-003), remembered-defaults
  (FEAT-008) — recorded as manifest gaps, not gaps in this feature.
