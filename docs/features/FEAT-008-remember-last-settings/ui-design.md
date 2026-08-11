# UI Design: FEAT-008 — Remember last mode/difficulty

> Feature: FEAT-008 · Epic: EPIC-SHELL · **Priority: Could**
> Technical design: technical-design.md (contracts §3) · Realizes UC-01 (alt 2a)
> Screens: **SCR-WEB-001 (Setup)** — new *remembered-defaults* state (no new
> component, no new visual)
> Design authority: docs/design.md §4 (mode-card, segmented control) — unchanged
> Status: Draft · Date: 2026-08-10

## Strategy resolution

- **Manifest lookup:** SCR-WEB-001 is **registered** (FEAT-001, Claude Design
  "Setup Screen") and already lists the gap **"remembered-defaults → FEAT-008"**.
  This feature closes exactly that gap.
- **No new screen, no new component.** FEAT-008 changes only **which options are
  pre-selected** when Setup mounts: the same mode-cards (`.mode`), difficulty
  segmented control (`.seg`), and note render — but seeded from the last-used
  settings rather than the hardcoded `two-player` / `medium` defaults.
- **Resolution:** **code-native supplement** (policy fallback; a state on an
  existing registered screen, like FEAT-006/007 supplements). The component
  visuals are unchanged and already conformant — no design, no escalation.

## SCR-WEB-001 — remembered-defaults state

- **Before (FEAT-001/002):** Setup always opens with **2 Players** selected,
  Difficulty **Medium**, side **X** — hardcoded.
- **After (FEAT-008):** on mount, the **selected mode-card** and the **active
  difficulty segment** reflect the **last-used** settings (technical-design §3.2).
  If there is no saved choice (first launch) or the data is corrupt, the built-in
  defaults are used (unchanged behavior). `humanMark` (side) is **not** remembered
  — stays **X** (technical-design §7 D2).
- **Visual/interaction:** identical to the existing registered Setup screen —
  the `.mode.sel` selected treatment, the `.seg .on` active segment, and the
  difficulty `.note` all render exactly as today; only the initial selection
  differs. When a remembered **vs-Computer** difficulty is restored, the
  Difficulty + "You play as" fields are revealed as usual (existing `sync()` logic,
  DEF-001 guard intact); when the remembered mode is **two-player** they stay
  hidden.
- **States:** no empty/loading/error surface — synchronous `localStorage`; the
  fallback-to-defaults path *is* the "no data" state and shows the normal screen.

## Contract bindings (from technical-design.md §3)

| UI element | Binds to |
| :--------- | :------- |
| Initial selected mode-card | `loadLastSettings()?.mode ?? "two-player"` (§3.2) |
| Initial active difficulty segment | `loadLastSettings()?.difficulty ?? "medium"` (§3.2) |
| Start button | `saveLastSettings({ mode, difficulty })` before `onStart` (§3.2, D1) |

## Decisions

- **U1 — Purely a default-selection change; reuse every existing control.** No
  new affordance signals "these are remembered" (no badge/hint) — the plan and
  FR-MODE-005 ask only to *default* to the last settings, and UC-01 2a is "accept
  and start." Driver: scope (a *Could*); minimal surface. A future FR could add a
  "resumed your last setup" hint, but none exists.

## Escalations

- **None.** No new component or token; the Setup screen's registered visuals are
  unchanged; the remembered-defaults state composes existing controls.

## Handoff

- Realized during **feature-implementation** (tasks.md T2 seeds the Setup
  selections from `loadLastSettings()` and persists on Start). No new CSS.
- Manifest updated: SCR-WEB-001 `remembered-defaults` gap **closed** (state
  covered via a FEAT-008 code-native supplement).
</content>
