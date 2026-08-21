# Tic-Tac-Toe

A browser-based Tic-Tac-Toe game: play a friend on one device or an AI that
ranges from beatable to unbeatable. Stats and preferences persist locally — no
account, no backend, nothing leaves your browser.

**Live:** https://tic-tac-toe-game-gilt-gamma.vercel.app

Built as a client-side static SPA in vanilla TypeScript — no UI framework, no
server, no runtime dependencies.

---

## Features

- **Two-player mode** — share one device; alternate turns, X first.
- **Vs. Computer** at three difficulties:
  - *Easy* — random legal moves.
  - *Medium* — takes the win, blocks the loss, otherwise random.
  - *Hard* — memoized minimax. It never loses; a draw is the best you can do.
- **Choose your side** — play X (first) or O (second); the AI opens if you pick O.
- **Statistics & history** — W/L/D tiles, a mode filter, and a chronological
  match list, persisted across sessions.
- **Reset statistics** behind a confirmation dialog.
- **Light/dark theme** — follows your OS preference on first load, then
  remembers your choice.
- **Remembers your last setup** — mode and difficulty are pre-selected next time.

## Quick start

Requires **Node 22+**.

```bash
npm ci
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

> `src/ui/generated/tokens.css` is generated, not committed. The `predev` and
> `prebuild` hooks regenerate it automatically — a fresh clone needs no extra
> step.

## Scripts

| Command | What it does |
| :------ | :----------- |
| `npm run dev` | Vite dev server (regenerates tokens first) |
| `npm run build` | Typecheck (`tsc`) + production build → `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm test` | Vitest unit tests · `npm run test:watch` to watch |
| `npm run test:e2e` | Playwright E2E (builds first, runs against the bundle) |
| `npm run lint` | ESLint, including the module-boundary rules |
| `npm run gen:tokens` | Regenerate `src/ui/generated/tokens.css` from `docs/tokens.json` |

## Project structure

```
src/
  core/    pure domain — game rules, AI, stats. No DOM.
  infra/   adapters — localStorage repository, logger.
  ui/      DOM shell, views, theme controller.
docs/      requirements, architecture, design system, per-feature specs
tests/e2e/ Playwright specs
scripts/   design-token generator
```

### Module boundaries

Dependencies point **inward**, and ESLint enforces it — a violating import fails
the build, not code review:

- `src/core/**` is pure. It must not import from `ui/` or `infra/`, and never
  touches the DOM. This is what makes the game rules and the minimax AI
  exhaustively unit-testable.
- `src/infra/**` may import `core/`, never `ui/`.
- `src/ui/**` imports inward from both.

### Design tokens

`docs/tokens.json` (W3C DTCG format) is the single source of truth for every
color, size, and spacing value. A generator turns it into CSS custom properties:

```
docs/tokens.json → scripts/gen-tokens.mjs → src/ui/generated/tokens.css → var(--…)
```

Never hand-copy a token value into a component — edit `tokens.json` and
regenerate, or light and dark will drift apart.

## Testing

Two layers, matching the architecture:

- **Vitest** unit tests for the domain core — including an exhaustive check that
  the Hard AI never loses from any reachable position.
- **Playwright** E2E smoke tests over the critical flows (play a game, review
  statistics), plus focused specs for theming, setup, and touch-target sizing.

```bash
npm test         # unit
npm run test:e2e # end-to-end
```

CI runs `gen:tokens → lint → test → build → E2E` on every push and pull request.

## Deployment

Hosted on **Vercel** as a static bundle. Merging to `main` deploys to production;
every branch and PR gets a preview URL automatically. Operational details —
rollback, monitoring, backups — are in [`docs/deployment-notes.md`](docs/deployment-notes.md).

## Documentation

This project was built document-first; each stage's output lives in `docs/`:

| Document | Contents |
| :------- | :------- |
| [`srs.md`](docs/srs.md) | Requirements, with IDs referenced throughout the code |
| [`use-cases.md`](docs/use-cases.md) | User-facing flows |
| [`architecture.md`](docs/architecture.md) | Structure, C4 diagrams, and the ADRs behind every stack choice |
| [`design.md`](docs/design.md) · [`tokens.json`](docs/tokens.json) | The design system |
| [`ux-foundations.md`](docs/ux-foundations.md) | Personas, navigation, screen inventory |
| [`implementation-plan.md`](docs/implementation-plan.md) | Epics and the feature build order |
| [`rtm.md`](docs/rtm.md) | Traceability: requirement → design → test |
| [`defects.md`](docs/defects.md) | Defect ledger |
| `features/FEAT-*/` | Per-feature technical design, UI design, tasks, acceptance report |

## License

None specified.
