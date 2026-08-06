# Scaffold Notes — Tic-Tac-Toe Game

The project-owned record of how the walking skeleton was scaffolded. Written as
we go. Consumers: future coding sessions, the build phases.

## Environment preflight (2026-07-14)

| Tool | Version | Notes |
|------|---------|-------|
| node | v22.18.0 | Satisfies Vite 5/6/7 (needs ≥18/20) |
| npm  | 10.9.3  | Chosen package manager (pnpm absent; solo project) |
| git  | 2.50.1  | Repo already initialized |
| Docker | — | Not required — no DB; persistence is browser `localStorage` (ADR-004) |

## Decisions (Phase 1–2 gaps)

- **Package manager:** npm — present, standard, solo developer.
- **Repo shape:** single package at repo root (one deployable container per
  architecture §7 / ADR-001; monorepo unwarranted).
- **Deploy target:** Vercel — `vercel.json` written (not executed) + GitHub
  Actions CI workflow for lint/test/build. No Vite `base` override needed
  (Vercel serves at domain root).

## Generators used

| Unit | Generator | Version | Command / flags |
|------|-----------|---------|-----------------|
| SPA (root) | create-vite | 9.1.1 | `npm create vite@latest _vite_tmp -- --template vanilla-ts` |

- Generated into a temp dir (`_vite_tmp`) then merged to repo root, because the
  root was already non-empty (`docs/`, `.git`) and running the generator in
  place would have triggered its interactive "directory not empty" prompt. Temp
  dir removed after merge.
- Generated toolchain versions (kept as-is): **vite ^8.1.1, typescript ~6.0.2**,
  `tsconfig.json` bundler-mode with `allowImportingTsExtensions` (so imports use
  explicit `.ts` extensions).

## Added tooling (Phase 2/6)

| Tool | Version | Purpose |
|------|---------|---------|
| vitest | ^4.1.10 | Domain-core unit tests (ADR-005); skeleton test |
| eslint + @eslint/js | ^10 | Lint + module-boundary enforcement |
| typescript-eslint | ^8.64 | TS parser/rules for flat config |
| globals | ^17 | Browser globals for lint |

## Structure & boundaries (pipeline layer)

- `src/core/` (pure, no DOM) · `src/ui/` (DOM shell + views) · `src/infra/`
  (logger; Storage Repository lands in FEAT-004) — ADR-003.
- **Boundaries enforced** by ESLint `no-restricted-imports` (flat config,
  `eslint.config.js`): `core` may not import `ui`/`infra`; `infra` may not
  import `ui`. Verified empirically — a probe `core → ui` import is rejected.

## Design-token wiring

- `docs/tokens.json` (DTCG) → `scripts/gen-tokens.mjs` → `src/ui/generated/tokens.css`
  (62 light + 17 dark CSS custom properties), consumed via `var(--…)` in
  `src/style.css`. Generated file is git-ignored; regenerated on `predev`/
  `prebuild` and in CI. Dark theme emitted under `:root[data-theme="dark"]` and
  an OS-default `@media (prefers-color-scheme: dark)` block (FR-THEME-001/002).

## Boilerplate removed

- Vite demo `src/counter.ts`, demo `src/style.css`, `src/assets/*`
  (hero.png, typescript.svg, vite.svg), `public/icons.svg`. Kept neutral
  `public/favicon.svg`.

## What's stubbed (skeleton scope, per plan §2)

- `core/board.ts` `evaluateStatus()` — win/draw detection → **FEAT-001**.
- Turn management / result banner in `ui/views/game.ts` → **FEAT-001**.
- Setup & Stats views are placeholders → **FEAT-001/002** & **FEAT-005**.
- Storage Repository (persistence) → **FEAT-004**. `infra/logger.ts` is the only
  infra module at skeleton stage.
- Theme toggle flips `data-theme` only; OS default + persistence → **FEAT-007**.

## Deploy & CI

- **Vercel** (`vercel.json`): framework `vite`, build `npm run build`, output
  `dist`, install `npm ci`. Written, **not executed** — first deploy is the
  user's step.
- **CI** (`.github/workflows/ci.yml`): on push to `main` / PRs — `npm ci` →
  `gen:tokens` → `lint` → `test` → `build`. First CI run is on first push.

## Verification results (Phase 7, local)

- Clean `npm ci` + build + test + lint: green (see below / delivery summary).
- Build: `tsc` typecheck + `vite build` → `dist/` (JS ~3.9 kB, CSS ~4.6 kB).
- Skeleton test (`src/core/board.test.ts`): 2 passed — this **is** the plan's
  done-when local half (UI→core placement + illegal-move rejection).
- Boundary rule: proven to reject a forbidden `core → ui` import.
- Token wiring: token values present in built CSS only via the generator, and
  consumed through `var()` (19 `var(--color-*)` refs), incl. dark theme.
- **Pending first deploy** (Vercel) and **first CI run** (on push).
