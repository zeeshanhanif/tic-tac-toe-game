# UI Design: FEAT-006 — Reset statistics

> Feature: FEAT-006 · Epic: EPIC-STATS
> Technical design: technical-design.md (contracts §3) · Realizes UC-07
> Screens: **SCR-WEB-005** (Reset Confirmation, new) + a supplement to
> **SCR-WEB-004** (the reset trigger control)
> Design authority: docs/design.md §4 (confirmation dialog, `.btn` danger/ghost),
> tokens.json · Strategy: **code-native** (SCR-WEB-005 not in the design source —
> design.md §9 known gap)
> Status: Draft · Date: 2026-08-09

## Strategy resolution

- **Manifest lookup:** SCR-WEB-005 has no entry. SCR-WEB-004 exists (registered,
  FEAT-005) with an explicit gap: *"reset control (button + confirm dialog) →
  FEAT-006"*.
- **Source lookup:** the Claude Design project has four screens (Setup, Game,
  Game-Win, Stats) — **no reset dialog**. design.md §9 lists the confirmation
  dialog as a *known gap: "not mocked — spec in §4 is a designed default; refine
  when building SCR-WEB-005."*
- **Resolution:** policy fallback → **code-native (Strategy C)**. The design
  system *does* specify the pieces (design.md §4 confirmation-dialog prose;
  `.btn` danger + ghost variants; radius/shadow/token roles), so this screen is a
  faithful composition of existing components, not new invention.

---

## SCR-WEB-004 supplement — the reset trigger (`.reset-note` + `.btn.danger`)

Closes the FEAT-005 gap. Added to the bottom of the Stats view, below the match
history:

- **A danger button** `Reset all statistics` — component `.btn` **danger**
  variant (design.md §4/§174): `--surface` fill, **`--o` text**, `--line` border,
  radius 14px, weight 700–800, min-height 48px, `--shadow`. Full-width in the
  460px column.
- **A one-line note** above/below it, `.reset-note`, 12–13/600 in
  **`--color-mutedStrong`** (AA — small essential text never `--muted`, design.md
  §5/§9): *"Clears all recorded games on this device."* Sets the consequence
  before the tap (FR-UI-003 intent).
- **Always-visible focus ring** (`--color-focus`, 2px) on the button — design.md
  §9 requires it; the mockups omit focus states.
- **Meaning not by colour alone** (NFR-USE-003): the button carries the word
  "Reset"; `--o` is reinforcement, not the only signal.

States: the control is **always present** (UC-07 has no visibility
precondition). On empty stats it still opens the dialog; confirming is a
harmless zeroed→zeroed re-render.

## SCR-WEB-005 — Reset Confirmation (modal dialog)

Realizes UC-07 step 2 (system asks for confirmation). Composition follows
design.md §4 *"Feedback — confirmation dialog"* exactly.

**Structure** (native `<dialog>`, opened with `showModal()` — technical-design
§7 D2; gives scrim, focus-trap, Esc-cancel, `role="dialog"`/`aria-modal` free):

```
┌───────────────────────────────┐   ← panel: --surface, radius 18px, --shadow,
│  Reset all statistics?        │      padding 24, max-width ≈ 340 (inside the
│                               │      460 column), centered over a scrim
│  This permanently clears all  │   ← title: 20/800 --ink
│  win/loss/draw counts and     │
│  match history on this device.│   ← body: 14/600 --color-mutedStrong
│  This can't be undone.        │
│                               │
│  ┌─────────┐   ┌───────────┐  │   ← button row: 1fr auto (design.md §layout
│  │ Cancel  │   │  Reset    │  │      ghost/action pattern), gap 12px
│  └─────────┘   └───────────┘  │
└───────────────────────────────┘
      ghost            danger
```

**Components & tokens** (all from design.md §4 / tokens.json — no hand-copied
values in code; consumed as `var(--…)`):

| Element | Component / tokens |
| :------ | :----------------- |
| Panel | `--color-surface`, radius **18px**, padding **24**, `--shadow` |
| Scrim (`::backdrop`) | ink-based overlay — **see escalation E1** (`--scrim`) |
| Title | 20/800 `--color-ink` — "Reset all statistics?" |
| Body | 14/600 `--color-mutedStrong` (AA) — consequence copy |
| Cancel button | `.btn` **ghost**: `--surface` fill, `--ink` text, `--line` border |
| Confirm button | `.btn` **danger**: `--surface` fill, `--o` text, `--line` border |
| Focus ring | `--color-focus` (2px) on both buttons; focus starts on **Cancel** (safer default for a destructive dialog) |

**Copy:**
- Title: **"Reset all statistics?"**
- Body: **"This permanently clears all win/loss/draw counts and match history on
  this device. This can't be undone."**
- Confirm label: **"Reset statistics"** · Cancel label: **"Cancel"**

**States & interaction (contract-bound to technical-design §3.2/§3.3):**

- **Open** — triggered by the SCR-WEB-004 danger button. Scrim covers the Stats
  view; focus trapped in the panel (native `showModal()`).
- **Confirm** (`onConfirm` → `statsStore.reset()`) — dialog closes; Stats view
  re-renders **zeroed**: tiles `0/0/0`, hero "No games yet", history empty-state
  "Play a game to see it here." (reuses SCR-WEB-004's registered empty state).
  Realizes UC-07 step 4 / AC-3.
- **Cancel** — ghost button, **Esc**, or **backdrop click** all close with **no
  `onConfirm`**; Stats view unchanged (UC-07 3a / AC-4).
- **Empty/loading/error:** no async — synchronous `localStorage` (design.md §4
  "loading — not applicable"). No error surface: if storage is unavailable the
  reset still zeroes the in-memory session state (NFR-REL-002); nothing to show.

**Accessibility (best-effort bar, NFR-A11Y-001 / design.md §5):** native
`<dialog>` provides modal semantics + focus trap; Esc cancels; destructive intent
is in the **label**, not colour alone; buttons ≥ 44×44 (min-height 48px, §4);
always-visible focus ring; initial focus on the non-destructive Cancel.

**Responsive (FR-UI-001, 320→desktop):** panel `max-width: min(340px, calc(100vw
- 32px))`, centered; button row stays 1fr/auto and wraps to stacked full-width
buttons below ~360px if needed. Lives inside the single 460px column system.

## Contract bindings (from technical-design.md §3)

| UI element | Binds to |
| :--------- | :------- |
| Reset trigger (SCR-WEB-004) | opens dialog via `openConfirmDialog(…)` (§3.2) |
| Confirm button | `onConfirm` → `statsStore.reset()` (§3.1) |
| Post-confirm re-render | `statsStore.snapshot()` (zeroed) re-read (§3.3, D1) |
| Cancel / Esc / backdrop | no store call — view state unchanged |

## Decisions

- **U1 — Reusable `confirm-dialog`, not a bespoke reset modal.** Specced as a
  generic `openConfirmDialog({title, body, confirmLabel, cancelLabel, onConfirm})`
  (matches technical-design §3.2) so FR-UI-003 ("*any* destructive action") has a
  reusable home; reset is its first caller. Driver: FR-UI-003 breadth + one modal
  in the app today.
- **U2 — Initial focus on Cancel.** Destructive dialogs should not put the
  keyboard on the dangerous action. Consequence: Enter-on-open cancels, not
  resets.
- **U3 — Backdrop click cancels.** Treated as an implicit dismiss (safe
  direction). Consistent with Esc. No accidental data loss possible from the
  scrim.

## Escalations

- **E1 (minor) — add a `--scrim` token.** design.md §4 names *"modal over a
  scrim"* but tokens.json defines no scrim colour, and introducing a raw overlay
  colour in CSS would be an off-system value (ui-design principle 2). **Proposed
  amendment toward ux-foundations:** add `elevation.scrim` /
  `--scrim` = `--ink` at ~40% alpha (light) and a darker alpha (dark theme),
  mirroring the existing two-tone `--shadow` derivation. **Interim:** the
  `::backdrop` uses `rgba(33,28,21,.4)` / dark `rgba(0,0,0,.55)` derived from
  `--ink`, to be replaced by `var(--scrim)` once the token lands. Non-blocking —
  the dialog is buildable now; recorded so it isn't a silent fork.

## Handoff

- Realized code-native during **feature-implementation** (tasks.md T2/T3): build
  `ui/views/confirm-dialog.ts` + the SCR-WEB-004 trigger; styles into
  `src/style.css` from tokens. Optional screenshot loop against this spec.
- Manifest updated: SCR-WEB-005 added (code-native, designed); SCR-WEB-004 gap
  closed with a supplement + E1 escalation recorded.
</content>
