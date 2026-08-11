# Tic-Tac-Toe Game — Agent Instructions

Browser-based Tic-Tac-Toe: a client-side static SPA (no backend). Every stack
choice traces to an ADR in the architecture — **the stack is settled; don't
relitigate it.**

## Pipeline documents (read before building)

- **Requirements:** `docs/srs.md` · use cases `docs/use-cases.md` · traceability `docs/rtm.md`
- **Architecture:** `docs/architecture.md` (ADRs, building blocks, cross-cutting concepts)
- **Design system (read for any UI work):** `docs/design.md` + `docs/tokens.json`
  (single source of truth for all design values) · UX `docs/ux-foundations.md`
- **Build plan:** `docs/implementation-plan.md` (epics, features `FEAT-NNN`, build order, first slice)
- **Scaffold record:** `docs/scaffold-notes.md` (generators, versions, what's stubbed)

## Commands

| Command | Does |
|---------|------|
| `npm run dev` | Vite dev server (regenerates tokens first) |
| `npm run build` | Typecheck (`tsc`) + Vite production build → `dist/` |
| `npm test` | Vitest (domain-core unit tests) · `npm run test:watch` to watch |
| `npm run lint` | ESLint incl. module-boundary rules |
| `npm run gen:tokens` | Regenerate `src/ui/generated/tokens.css` from `docs/tokens.json` |

## Architecture & module boundaries (ADR-003 — enforced by ESLint)

Dependencies point **inward**. Do not break these — `no-restricted-imports`
will fail the build:

- `src/core/**` — pure domain (Game Engine, later AI & Stats). **No DOM, no
  imports from `ui/` or `infra/`.** Unit-tested (NFR-MAINT-002).
- `src/infra/**` — adapters (logger; Storage Repository in FEAT-004). May import
  `core/`, never `ui/`.
- `src/ui/**` — DOM shell and views. Imports inward from `core/`/`infra/`.

## Design system wiring

`docs/tokens.json` (W3C DTCG) → `scripts/gen-tokens.mjs` → `src/ui/generated/tokens.css`
(CSS custom properties) → consumed via `var(--…)` in `src/style.css`. **Never
hand-copy token values into components** — edit `tokens.json` and regenerate.

## Building a feature

Features are the vertical slices `FEAT-NNN` in `docs/implementation-plan.md`.
Each slice gets per-slice **detailed-design** (contracts/data) and **ui-design**
(screens by `SCR-WEB-NNN`) before coding. First slice up: **FEAT-001** (local
two-player match). Skeleton stubs are marked `TODO(FEAT-xxx)` — replace, don't
work around.

## Per-feature quality gate (review after every feature)

The per-feature loop is **not** done when `acceptance-verification` returns
*Accepted*. Before a feature is declared **verified** and the loop advances, run
a **code review of that feature's diff** as a gate:

1. **Trigger:** immediately after `acceptance-verification` accepts a feature
   (its `acceptance-report.md` is written and the RTM Test ref appended). This is
   part of the loop, not optional — the orchestrator runs it every time.
2. **Scope:** `/code-review` over the feature's commit range only (the
   `FEAT-NNN …` commits since the previous feature), not the whole tree.
3. **Why it's additive:** acceptance-verification audits *tests vs. criteria* and
   reruns the suites; it does **not** hunt correctness/reuse/efficiency bugs.
   This gate covers that gap — catching a defect at the feature that introduced
   it, not plan-end.
4. **Route the findings:**
   - **Correctness bugs** (contract/requirement violations) → log a **DEF-NNN**
     in `docs/defects.md` and fix via the **maintenance protocol** (failing test
     first → scoped fix → re-verify) *before* the feature counts as verified.
   - **Quality only** (reuse/simplification/efficiency) → optional cleanup
     (`/simplify`), never blocking.
   - **Debatable/design** findings → surface to the user; don't self-resolve.
5. **Depth:** the gate uses standard `/code-review` (in-session). The deeper
   `/code-review ultra` (cloud, billed) stays a **manual** milestone review — the
   loop never launches it.

This is a *semantic* gate owned by the loop — deliberately **not** a settings
hook, since "feature completed" is not a harness event and the review is agentic
(a hook can only enforce the mechanical `lint`/`test`/`build` floor).
