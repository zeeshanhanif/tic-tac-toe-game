# Architecture: Tic-Tac-Toe Game

> Status: Draft · Last updated: 2026-08-07 · Author: zeeshanhanif
>
> **Amendments:** 2026-08-07 — added **ADR-006 (Playwright UI/E2E smoke tests)**
> and a cross-cutting **Testing** entry naming the critical flows (CF-1, CF-2).
> Complements ADR-005; does not change the settled stack (ADR-001/002).

## 1. Introduction and Goals

This is the architecture for a browser-based Tic-Tac-Toe game. It is a
self-contained, client-side single-page application with no backend: the classic
3×3 game playable against a computer opponent (Easy / Medium / Hard-minimax) or
another person on the same device, with win/loss/draw statistics and match
history persisted locally.

Requirements are defined in [`docs/srs.md`](./srs.md) (the source of truth) and
elaborated in [`docs/use-cases.md`](./use-cases.md). This document references
those by ID rather than restating them.

**Top quality goals (ranked):**

1. **Maintainability & testability** [NFR-MAINT-001, NFR-MAINT-002] — the game
   rules and AI must live independently of the DOM so they can be unit-tested in
   isolation. This is the primary shaper of the internal structure.
2. **Portability** [NFR-PORT-001, NFR-PORT-002] — must build to static files,
   deploy to any static host/CDN, and run fully offline after load.
3. **Performance** [NFR-PERF-001, NFR-PERF-002, NFR-PERF-003] — moves reflected
   < 100 ms, Hard AI < 500 ms, interactive < 3 s.
4. **Privacy** [NFR-PRIV-001, NFR-PRIV-002] — no PII, no network calls during
   play; all data stays on-device.

## 2. Constraints

| # | Constraint | Source |
|---|------------|--------|
| C-1 | Client-side only; no server-side components or database | SRS §2.4 C-1 |
| C-2 | Persistence limited to browser `localStorage` | SRS §2.4 C-2 |
| C-3 | Must function fully offline after initial load | SRS §2.4 C-3 |
| C-4 | Assumes browser with JS + `localStorage` support | SRS §2.5 A-1 |
| C-5 | Stack: Vanilla TypeScript + Vite (this decision — ADR-001/ADR-002) | Elicited |
| C-6 | Single-developer project; minimal ops appetite | Elicited |

## 3. Context and Scope

The system is a single web page loaded by the user's browser. Its only external
touchpoints are the browser's `localStorage` (persistence) and the
`prefers-color-scheme` media feature (default theming). There is no network
communication after the assets are served, and no backend.

```mermaid
graph TB
  Player(["Player<br/>(human)"])
  subgraph Browser["User's Web Browser"]
    App["Tic-Tac-Toe SPA<br/>(HTML/CSS/TS, static)"]
    LS[("localStorage<br/>stats · history · prefs")]
    CS["prefers-color-scheme<br/>(media feature)"]
  end
  CDN["Static Host / CDN<br/>(Netlify · Vercel · GH Pages)"]

  Player -->|clicks / taps| App
  App -->|read/write| LS
  App -->|read default theme| CS
  CDN -.->|serves static assets<br/>once, then offline| App
```

**External interfaces:** `localStorage` API (SI-1), `prefers-color-scheme`
(SI-2), pointer/touch input. No communication interfaces (SRS §5.4).

## 4. Solution Strategy

- **Single static SPA, no backend** — the whole product is HTML/CSS/JS served
  statically (ADR-001). Driven by C-1, NFR-PORT-001.
- **Vanilla TypeScript + Vite** — no UI framework; TypeScript for a typed,
  testable core (ADR-002). Driven by NFR-MAINT-001, project size, C-6.
- **Layered separation: pure domain core vs. UI shell** — all game rules, AI,
  and outcome logic are framework-free pure functions/modules; a thin UI layer
  renders state and forwards input (ADR-003). Driven by NFR-MAINT-001/002.
- **`localStorage` behind a repository abstraction** — persistence isolated
  behind one module that degrades gracefully when storage is unavailable
  (ADR-004). Driven by C-2, NFR-REL-002.
- **Vitest for unit tests** — co-located with Vite, tests the domain core
  (ADR-005). Driven by NFR-MAINT-002.
- **Playwright for UI/E2E smoke tests** — a thin headless-browser net over the
  critical user flows the core tests can't see (ADR-006). Second tier below the
  unit tests; targets the named critical flows (§8 Testing), not exhaustive UI
  coverage.

## 5. Building Block View

One deployable artifact (the static bundle). Internally it is organized into a
**pure domain core** (no DOM, fully testable) and a **UI shell** that depends
inward on the core — dependencies point toward the core, never outward.

```mermaid
graph TB
  subgraph Shell["UI Shell (DOM-aware)"]
    Main["main.ts<br/>bootstrap / routing"]
    SetupView["Setup View<br/>mode · difficulty"]
    GameView["Game View<br/>board · turn · result"]
    StatsView["Stats View<br/>summary · history"]
    ThemeCtl["Theme Controller"]
  end

  subgraph Core["Domain Core (pure TS, no DOM)"]
    GameEngine["Game Engine<br/>state · legal moves · win/draw"]
    AI["AI Module<br/>easy · medium · minimax"]
    StatsSvc["Stats Service<br/>tally · history model"]
  end

  subgraph Infra["Infrastructure"]
    Store["Storage Repository<br/>localStorage adapter"]
  end

  Main --> SetupView & GameView & StatsView & ThemeCtl
  GameView --> GameEngine
  GameView --> AI
  GameView --> StatsSvc
  SetupView --> GameEngine
  StatsView --> StatsSvc
  StatsSvc --> Store
  ThemeCtl --> Store
  AI --> GameEngine
```

**Building blocks:**

- **Game Engine** (core) — owns board state, turn management, legal-move
  validation, and win/draw detection as pure functions over an immutable board.
  Realizes FR-GAME-002..010, FR-MODE (turn order). No DOM, no timers.
- **AI Module** (core) — given a board and difficulty, returns the next move.
  Easy = random legal (FR-AI-001); Medium = win/block-else-random (FR-AI-002);
  Hard = minimax, guaranteed non-losing (FR-AI-003). Pure; depends only on the
  Game Engine's rules.
- **Stats Service** (core) — updates W/L/D tallies and appends match-history
  records at game end (FR-STATS-001/002/007); reads them for display
  (FR-STATS-003/004). Serializable plain data; delegates persistence to the
  Storage Repository.
- **Storage Repository** (infra) — the only module that touches `localStorage`
  (FR-STATS-005, FR-THEME-003, FR-MODE-005). Wraps reads/writes in try/catch and
  falls back to an in-memory store when storage is unavailable (NFR-REL-002).
- **UI Shell** (DOM) — `main.ts` bootstraps and switches between Setup, Game,
  and Stats views (FR-UI-002); views render core state and forward clicks; the
  Theme Controller applies/persists light-dark (FR-THEME-*). The AI move delay
  and winning-line highlight (FR-AI-004, FR-GAME-008) live here, not in the core.

## 6. Runtime View

**Human move & outcome resolution [UC-02, UC-04]:**

```mermaid
sequenceDiagram
  actor P as Player
  participant V as Game View
  participant E as Game Engine
  participant S as Stats Service
  participant R as Storage Repo

  P->>V: click cell
  V->>E: applyMove(board, cell, mark)
  E-->>V: {board', status}
  alt status == won or draw
    V->>V: highlight line / announce (FR-GAME-008/010)
    V->>S: recordResult(mode, difficulty, result)
    S->>R: persist(stats, history)
    R-->>S: ok (or in-memory fallback)
  else in progress
    V->>V: update turn indicator
  end
```

**Computer turn [UC-03]** (vs. Computer, AI's turn): after a human move that
leaves the game in progress, the Game View schedules the AI via a short delay
(FR-AI-004), calls `AI.chooseMove(board, difficulty)` → `Game Engine.applyMove`,
then resolves the outcome exactly as above. Illegal moves are impossible because
the AI selects only from the engine's legal moves (FR-AI-005). Occupied-cell and
after-game clicks are rejected by the engine and ignored by the view
(FR-GAME-003/004).

## 7. Deployment View

A single static bundle (`index.html` + hashed JS/CSS assets) produced by
`vite build`, uploaded to any static host or CDN (Netlify, Vercel, GitHub
Pages). No runtime, no environment configuration, no secrets. Cache-busting via
Vite's content-hashed filenames; the app runs offline after first load
(NFR-PORT-002). Topology is trivial — no deployment diagram warranted.

## 8. Cross-cutting Concepts

- **Security & privacy** — no auth (no accounts, SRS §2.2); no PII collected or
  transmitted (NFR-PRIV-001); zero network calls during play (NFR-PRIV-002). The
  only stored data is game stats/prefs in `localStorage`, treated as
  non-sensitive.
- **Data & persistence** — plain serializable objects (stats tallies, an
  append-only history array, theme/settings) written as JSON under versioned
  `localStorage` keys via the Storage Repository. A schema-version field guards
  against format changes; unreadable/corrupt data resets to defaults rather than
  crashing. No backup/recovery obligations (device-local by design).
- **Resilience & error handling** — the domain core is total over valid inputs;
  the engine rejects illegal moves instead of throwing. `localStorage` access is
  wrapped so quota/availability failures degrade to a session-only in-memory
  store (NFR-REL-002). Rapid/duplicate input is idempotent because moves validate
  against current board state (NFR-REL-001).
- **Testing** — two tiers. (1) **Unit tests** for the domain core (game engine,
  AI) via Vitest — the primary net and the mandated coverage (ADR-005,
  NFR-MAINT-002). (2) **End-to-end UI smoke tests** via Playwright (ADR-006),
  run headless in CI, over the **critical user flows** — thin happy-path
  coverage that the DOM-free core tests structurally cannot reach (turn
  rendering, the AI move delay, navigation, result banners). The named critical
  flows:
  - **CF-1 — Play a game**: from Setup choose mode/difficulty/side → play moves
    (human and, in vs-Computer, the AI) → reach a **win** and a **draw** → New
    Game / Menu. Realizes UC-01, UC-02, UC-03, UC-04, UC-05.
  - **CF-2 — Review & reset statistics**: open the stats view → see W/L/D tallies
    and match history → reset with confirmation. Realizes UC-06, UC-07.

  Per-feature **detailed-design mints an E2E task (flow-aware)** when a feature
  completes a segment of a named critical flow — extending the smoke spec to
  what the flow can then demonstrably do end-to-end, not re-testing stubs. The
  theme toggle (UC-08) is deliberately **not** a critical flow (cosmetic, no
  state/outcome). Because CF-1 is already shippable (FEAT-001/002), standing up
  the Playwright harness + the first CF-1 smoke is **engineering-foundations
  work** — see the plan's foundations (implementation-planning amendment).
- **Observability** — none required (no backend, no telemetry, privacy-first).
  Development uses console diagnostics only.
- **Performance & scaling** — "scaling" is per-client and constant: a 3×3 board
  has a tiny state space, so minimax explores the full game tree instantly, well
  within the 500 ms budget (NFR-PERF-002); no memoization needed but trivial to
  add. Rendering touches nine cells, so moves are effectively instant
  (NFR-PERF-001). Vite tree-shakes to a small bundle for < 3 s interactivity
  (NFR-PERF-003).

## 9. Architecture Decisions

### ADR-001 — Client-side static SPA, no backend
- **Status:** Accepted
- **Context:** The product is a local game with device-local stats; the SRS
  forbids server components and mandates offline operation.
- **Decision:** Ship a purely client-side single-page app as static assets.
- **Options considered:** (a) Static SPA; (b) SPA + thin backend for stats sync;
  (c) full-stack app. (b)/(c) add hosting, ops, and privacy surface for zero
  required benefit.
- **Consequences:** Trivial hosting and offline support; no cross-device sync
  and no server-side leaderboard (both out of scope). 
- **Requirements addressed:** C-1, NFR-PORT-001, NFR-PORT-002, NFR-PRIV-002.

### ADR-002 — Vanilla TypeScript + Vite (no UI framework)
- **Status:** Accepted
- **Context:** A 3×3 game has a tiny UI surface; a single developer wants a
  small, fast, low-dependency codebase, but also type safety on the core logic.
- **Decision:** Build with plain TypeScript and Vite; no React/Svelte.
- **Options considered:** (a) Vanilla TS+Vite; (b) React+Vite; (c) Svelte. A
  framework adds bundle weight and concepts that this UI doesn't need; TS gives
  the type safety that most benefits the engine/AI.
- **Consequences:** Smallest bundle and fastest load; manual DOM rendering in the
  UI shell (a modest, well-contained cost given the tiny view count).
- **Requirements addressed:** NFR-MAINT-001, NFR-PERF-003, NFR-PORT-001.

### ADR-003 — Layered separation: pure domain core vs. UI shell
- **Status:** Accepted
- **Context:** The SRS explicitly requires game logic decoupled from the UI and
  unit-tested.
- **Decision:** Put all rules, AI, and stats logic in DOM-free modules that the
  UI depends on one-directionally; keep timers, highlighting, and rendering in
  the shell.
- **Options considered:** (a) Layered core/shell; (b) logic intermixed with DOM
  handlers. (b) makes the core untestable without a DOM.
- **Consequences:** Core is testable in pure Node/Vitest with no DOM mocks; a
  clear seam to later swap the UI layer if ever desired.
- **Requirements addressed:** NFR-MAINT-001, NFR-MAINT-002.

### ADR-004 — `localStorage` behind a Storage Repository with graceful fallback
- **Status:** Accepted
- **Context:** Persistence is required but `localStorage` can be disabled, full,
  or throw; the app must still work.
- **Decision:** Route all persistence through one repository module that
  serializes JSON under versioned keys and falls back to an in-memory store on
  failure.
- **Options considered:** (a) Repository abstraction; (b) call `localStorage`
  directly from views. (b) scatters error handling and couples views to storage.
- **Consequences:** Single place for schema versioning and error handling;
  session-only degradation when storage is unavailable.
- **Requirements addressed:** FR-STATS-005, FR-THEME-003, FR-MODE-005,
  NFR-REL-002.

### ADR-005 — Vitest for unit testing the domain core
- **Status:** Accepted
- **Context:** NFR-MAINT-002 mandates automated tests for win detection and AI.
- **Decision:** Use Vitest (shares Vite config/transform) to unit-test the core.
- **Options considered:** (a) Vitest; (b) Jest. Vitest integrates with the Vite
  toolchain with no extra transform config.
- **Consequences:** Fast, zero-config tests; ties test tooling to the Vite
  ecosystem (acceptable, non-critical lock-in).
- **Requirements addressed:** NFR-MAINT-002.

### ADR-006 — Playwright for UI/E2E smoke tests
- **Status:** Accepted (2026-08-07 amendment)
- **Context:** ADR-005 covers the DOM-free core, but the UI shell — turn
  rendering, the AI move delay/auto-move, navigation (Setup ↔ Game ↔ Stats),
  result banners and the winning-line highlight — has **no automated coverage**.
  FEAT-001 and FEAT-002 were UI-verified only by manual browser observation
  (each acceptance report logged this as a minor finding). As the UI surface
  grows (stats, reset dialog, theming) manual-only verification stops scaling and
  leaves regressions uncaught.
- **Decision:** Adopt **Playwright** for a thin tier of **end-to-end UI smoke
  tests** over the critical flows named in §8 (CF-1, CF-2), running the built app
  headless in CI. Scope is happy-path smoke — prove the flow works end-to-end —
  **not** exhaustive component testing (the core keeps that in unit tests).
- **Options considered:**
  - **(a) Playwright** — real browser (own headless Chromium, no extension),
    autonomous in CI, screenshots for debugging. Cost: a dev dependency, a
    browser download in CI, and a second runner alongside Vitest.
  - **(b) jsdom + Vitest** — lighter (in the existing runner), but a *simulated*
    DOM: no real layout/CSS/paint, so it can't verify rendering, the highlight,
    or timing-based behavior faithfully.
  - **(c) Manual browser verification only** — status quo; zero tooling but no
    regression net and doesn't scale.
  Chose (a): faithful real-browser verification is what the UI acceptance
  actually needs; (b) can't see what UI regressions look like; (c) is what this
  ADR exists to fix.
- **Consequences:** Real UI regression coverage for the critical flows, runnable
  in CI without the Claude-in-Chrome extension. Adds a browser download to CI and
  a second test runner to maintain; keep the E2E suite **thin** (smoke, not
  sprawl) so it stays fast and low-flake. Realizing it is engineering-foundations
  work (Playwright harness + CF-1 smoke, backfilled since CF-1 already ships) plus
  per-feature flow-aware E2E tasks from detailed-design.
- **Requirements addressed:** NFR-MAINT-002 (extends the automated-test mandate
  to the UI layer); supports UC-01..UC-07 (CF-1, CF-2). No new NFR is minted here
  — if a formal "critical UI flows shall have automated E2E smoke tests" NFR is
  wanted, that is a separate requirements-engineering amendment.

## 10. Quality Requirements

| Scenario | Target | Source |
|----------|--------|--------|
| Player taps an empty cell | Mark rendered within 100 ms | NFR-PERF-001 |
| Hard AI computes its move on a mid-range device | Move played within 500 ms | NFR-PERF-002 |
| First load on broadband | Interactive within 3 s | NFR-PERF-003 |
| `localStorage` disabled/full | App still playable; stats non-persistent, no crash | NFR-REL-002 |
| Hard AI over many games | Never loses (only wins or draws) | FR-AI-003 |
| Corrupt/old stored data on load | Resets to defaults, no crash | NFR-REL-001 |
| A critical UI flow (CF-1/CF-2) regresses | Playwright smoke fails in CI before merge | ADR-006, NFR-MAINT-002 |

## 11. Risks and Technical Debt

- **Manual DOM rendering** (from the no-framework choice) can grow error-prone if
  scope expands (e.g., online play, board variants). Mitigation: keep views thin;
  revisit ADR-002 if the UI surface grows materially.
- **Device-local persistence** means stats don't survive clearing browser data or
  moving devices — acceptable and by design, but worth stating to users.
- **No observability** — bugs in the wild are invisible. Acceptable for a
  privacy-first offline game; revisit only if a support need arises.
- **Assumption:** the 3×3 minimax is cheap enough to run un-memoized within
  budget. Holds comfortably for 3×3; would need revisiting only if board variants
  (out of scope) were ever added.
- **E2E maintenance & flake** (from ADR-006) — a second test runner plus a
  browser download in CI, and E2E tests are flakier than unit tests. Mitigation:
  keep the Playwright suite **thin** (smoke over CF-1/CF-2 only), assert on stable
  roles/text not pixels, and treat any flake as a defect. CF-1's smoke is a
  foundations backfill (the flow already ships in FEAT-001/002).
```
