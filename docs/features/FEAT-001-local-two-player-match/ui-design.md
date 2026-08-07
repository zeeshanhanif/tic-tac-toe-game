# UI Design: FEAT-001 — Local two-player match

> Feature from: docs/implementation-plan.md · Pairs with: technical-design.md
> Screens: SCR-WEB-001, SCR-WEB-002, SCR-WEB-003 · Mode: per-feature · Status: Draft · Date: 2026-08-06
> First ui-design run — implicit-anchor scrutiny applied. **Verdict: the system
> composes cleanly** into all three screens; no design-system amendment needed.

All three screens exist in the connected **Claude Design** project
(`design.md §9` provenance) and are **registered** (Strategy A) against their
source files. The design system (`docs/design.md` + `docs/tokens.json`) is the
authority; the source screens conform by construction (design.md was codified
from them), with the corrections below where the *authority* moved ahead of the
mockups. Realization is code-native DOM (ADR-002) consuming the wired tokens —
implementation should run a screenshot loop against these specs + the source.

## SCR-WEB-001 — Setup / New Game

- **Strategy & source:** registered — Claude Design, `Setup Screen.dc.html`
  (project `b44687fd…`). This section adds the FEAT-001 2-player variant.
- **Composition** (design.md §4 components): top bar (`wordmark` + `toggle`
  theme control) · `hero` (h1 "New Game" + sub) · **`mode-card` ×2** segmented
  as a 2-col grid ("Vs. Computer", "2 Players"), selected card gets the 2px
  `--ink` ring · Start `btn.primary` · footer link "View stats & history". On
  the centered 460px column, 22px section rhythm.
- **Content & data mapping:** the mode choice builds `GameConfig{mode}` →
  `core.newGame()` on Start (technical-design §3.2, §4). No server data.
- **Conformance:** pass. Corrections: `.mdesc`/`.note` small text →
  `--color-mutedStrong` (AA); add focus ring on cards/segments/Start
  (design.md §9).

### default
The **2-player variant** (this feature's state): "2 Players" mode card
selectable and, when selected, the **Difficulty segmented control and the "You
play as" pills are hidden** (they are vs-Computer-only — plan SCR-WEB-001 states
"2-player hides them"). Start launches a 2-player game. The source screen shows
the vs-Computer state (difficulty Easy/Medium/Hard + side pills); that full
state is **deferred to FEAT-002** (recorded as a manifest gap, not built here).
`remembered-defaults` state → FEAT-008.

- **Responsive notes:** single column already ≤ 460px; mode grid stays 2-col to
  320px (cards flex). Standard system breakpoint behavior — no override.
- **Decisions:** *2-player-only Start.* Driver: plan sequencing (FEAT-002 owns
  vs-Computer). Rejected: wiring difficulty/side now — out of slice. Consequence:
  the mode card renders but only "2 Players" starts a game this slice.

## SCR-WEB-002 — Game — In Play

- **Strategy & source:** registered — Claude Design, `Game Screen.dc.html`.
  This section adds the FEAT-001 2-player scoreboard variant.
- **Composition** (design.md §4): top bar (`wordmark` + `toggle`) · **`scores`**
  = two `card`s each with `badge` (X blue / O orange) + name/sub + score, the
  active player's card carrying the colored `.active` ring (X or O) ·
  **`turn indicator`** (pulse dot + text) · **`board`** (recessed `--surface-2`
  tray, 3×3 of `cell`) · `actions` (New Game `btn.primary` + Menu `btn.ghost`) ·
  footer link.
- **Content & data mapping:** board cells ← `GameState.board[0..8]`
  (`cell.x`/`cell.o`); active card + turn text ← `GameState.current`; a click on
  a `cell.playable` → `core.playMove(state, i)` (rejected moves change nothing —
  technical-design §3.2). New Game → `core.newGame()`; Menu → Setup.
- **Conformance:** pass. Corrections in the 2-player variant below + focus rings
  on cells and action buttons (design.md §9).

### default
- **Turn indicator** is **visible text** — "X's turn" / "O's turn" — with the
  pulse dot tinted `--x`/`--o` (never color alone — FR-GAME-006, NFR-USE-003).
- **two-player-scoreboard variant:** the two `card`s read **"Player 1 · X"** and
  **"Player 2 · O"** (not "You/Computer/Hard AI" — ux-foundations Part D). The
  **score numeral is deferred to FEAT-004** (no session/persistent tally this
  slice); render the card without the number (or a static "—"). Active-turn ring
  follows `current`.
- **cell hover/ghost:** empty playable cells show the current mark as a faint
  ghost (`cell.ghost`, opacity ~.16, tinted to `current`) on hover; ≥44px
  targets (NFR-USE-002).
- **occupied / ended input ignored:** clicks on filled cells or after game end
  are no-ops (FR-GAME-003/004) — no visual change, no error.
- `computer-thinking` state → **FEAT-002** (manifest gap).

- **Responsive notes:** board is an aspect-square 3×3 grid that scales with the
  460px→320px column; scores stay 2-col. System defaults.
- **Decisions:** *score numeral deferred.* Driver: stats/persistence is FEAT-004.
  Consequence: FEAT-001 scoreboard shows identity + turn, not a running tally.

## SCR-WEB-003 — Game — Result

- **Strategy & source:** registered — Claude Design, `Game Screen - Win.dc.html`.
  This section adds the code-native **draw** variant (unmocked — Part D).
- **Composition** (design.md §4): same layout as SCR-WEB-002 with the
  **`result-banner`** inserted above the board and the winning `cell`s carrying
  the `.win` treatment (`--win-soft` fill, green border, `--win` mark); winner's
  `card` gets the `.winner` green ring. Actions become **Play Again**
  `btn.primary` + Menu `btn.ghost`.
- **Content & data mapping:** shown when `GameState.status.kind !== "in-progress"`;
  winning cells ← `status.line` (technical-design §3.1 D3); banner text ←
  `status` (won mark / draw).
- **Conformance:** pass. Corrections: 2-player copy "You win!" → **"X wins!" /
  "O wins!"**; draw sub-copy uses `--color-mutedStrong` (AA).

### win
Result banner in `--win-soft` with `--win` headline "**X wins!**" / "**O wins!**"
and a sub line (e.g. "Three in a row"); the three `status.line` cells get `.win`;
the winner's scoreboard card gets the green `.winner` ring (FR-GAME-008/010).

### draw
**Code-native supplement (unmocked).** The same `result-banner` in a **neutral**
variant — `--surface`/`--line` (or `--surface-2`), **no win green** — headline
"**Draw**", sub "Nobody wins — play again?" (`--color-mutedStrong`). No cell
highlight (no winning line). Announced as visible text (FR-GAME-009/010,
NFR-USE-003).

- **Responsive notes:** banner is full-column; wraps within 320px. System default.
- **Decisions:** *draw reuses result-banner with neutral tokens* rather than a
  new component. Driver: conform-not-fork — composing existing components is
  in-scope; a new banner kind would escalate. Consequence: no design-system
  amendment.

## Cross-screen decisions

- **Theme toggle** (`toggle`) appears on every screen (global control, UC-08) —
  functional theming is FEAT-007; here it renders and flips `data-theme` (the
  skeleton already wires this), tokens supply both themes.
- **Small essential text → `--color-mutedStrong`** everywhere (mode/turn subs,
  result sub) — the single AA correction applied across all three screens
  (design.md §5/§9).
- **Always-visible focus rings** (`--color-focus`, 2px) on every interactive
  element (cells, cards, segments, pills, buttons, links) — added across all
  screens per the accessibility bar (ux-foundations §A4); the skeleton
  `style.css` already establishes the `:focus-visible` pattern.

## Escalations & open items

- **None.** No off-system component/token/pattern; the draw banner and 2-player
  scoreboard are content variants of existing components (result-banner, card).
  Deferred states (vs-Computer setup, computer-thinking, remembered-defaults,
  score numerals) are owned by FEAT-002/004/008 and recorded as manifest gaps —
  not gaps in this feature.
