# Software Requirements Specification — Tic-Tac-Toe Game

- **Document status:** FINALIZED
- **Version:** 1.0
- **Date:** 2026-07-09
- **Standard lineage:** ISO/IEC/IEEE 29148 (IEEE 830)

## Revision History

| Version | Date       | Author         | Description            |
|---------|------------|----------------|------------------------|
| 1.0     | 2026-07-09 | zeeshanhanif   | Initial finalized SRS  |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the complete functional and non-functional requirements
for a browser-based Tic-Tac-Toe game. It is the single source of truth for the
downstream architecture, UX, and implementation-planning work.

### 1.2 Product Vision

A lightweight, fast, and pleasant web-based Tic-Tac-Toe game that lets a user
play the classic 3×3 game either against a computer opponent (at selectable
difficulty) or against another person on the same device, while tracking their
results locally over time.

### 1.3 Business Goals & Success Metrics

- **G-1:** Deliver a fully playable game that a first-time visitor can start
  within seconds and complete without instructions.
- **G-2:** Provide an "unbeatable" AI as a credible challenge and easier levels
  for casual play.
- **G-3:** Encourage return visits by persisting the player's stats locally.
- **Success metrics:** a game can be started in ≤ 2 interactions from load; the
  Hard AI never loses; stats survive a browser restart.

### 1.4 Scope

**In scope (MVP):**
- Classic 3×3 Tic-Tac-Toe gameplay with full win/draw detection.
- Two game modes: vs. computer and local two-player (shared device).
- Three AI difficulty levels: Easy, Medium, Hard (unbeatable).
- On-device statistics (win/loss/draw counts) and match history, persisted.
- Light/dark theming.
- Responsive web UI (desktop and mobile browsers).

**Out of scope:**
- User accounts, authentication, or cloud sync.
- Online / networked multiplayer.
- Board sizes other than 3×3 and rule variants.
- Sound effects, undo/redo, and custom player-name entry.
- Native mobile/desktop applications and any server-side backend.

### 1.5 Definitions, Acronyms, Glossary

| Term | Definition |
|------|------------|
| **Cell** | One of the nine squares of the 3×3 board. |
| **Mark** | A player's symbol: `X` or `O`. |
| **Winning line** | Three identical marks in a row, column, or diagonal. |
| **Draw** | A full board with no winning line. |
| **Minimax** | Optimal-play algorithm used by the Hard AI; guarantees no loss. |
| **Local two-player** | Two humans alternating turns on the same device. |
| **localStorage** | Browser API used to persist data across sessions. |
| **AI** | The computer opponent. |

### 1.6 References

- ISO/IEC/IEEE 29148:2018 — Requirements engineering.
- ISO/IEC 25010 — System and software quality models (basis for NFRs).
- Companion documents: `docs/use-cases.md`, `docs/rtm.md`.

---

## 2. Overall Description

### 2.1 Product Perspective

A self-contained, client-side single-page web application. It requires no
backend server; all logic runs in the browser and all persisted data is stored
locally via `localStorage`.

### 2.2 User Classes and Characteristics

| User Class | Description | Technical Skill |
|------------|-------------|-----------------|
| **Casual Player** | Anyone who wants a quick game; may play solo vs. AI or with a friend on one device. | Low — expects zero setup. |
| **Competitive Player** | Wants a challenge; plays the Hard AI and tracks stats/streaks over time. | Low–Medium. |

There are no administrative or privileged user roles; every user has identical
capabilities.

### 2.3 Operating Environment

- Modern desktop and mobile web browsers (see NFR-COMPAT-001).
- No installation, network connectivity (after initial load), or login required.

### 2.4 Design and Implementation Constraints

- **C-1:** Client-side only; no server-side components or databases.
- **C-2:** Persistence limited to browser `localStorage`.
- **C-3:** Must function fully offline after the initial page load.

### 2.5 Assumptions and Dependencies

- **A-1:** The user's browser supports `localStorage` and JavaScript.
- **A-2:** A single browser profile corresponds to a single stats dataset (stats
  are per-browser, per-device, not per-user identity).
- **A-3:** Users share a device consciously in local two-player mode (no
  turn-privacy is required).

---

## 3. Functional Requirements

Priority legend: **M** = Must (MVP), **S** = Should, **C** = Could.

### 3.1 Core Gameplay (FR-GAME)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GAME-001 | The system shall display a 3×3 grid of nine selectable cells. | M |
| FR-GAME-002 | The system shall let the active player place their mark on an empty cell via click or tap. | M |
| FR-GAME-003 | The system shall reject and ignore attempts to play on an already-occupied cell. | M |
| FR-GAME-004 | The system shall reject any move once the game has ended (win or draw). | M |
| FR-GAME-005 | The system shall alternate turns between `X` and `O`, with `X` moving first each game. | M |
| FR-GAME-006 | The system shall clearly indicate whose turn it is at all times during an active game. | M |
| FR-GAME-007 | The system shall detect a win when any row, column, or diagonal contains three identical marks. | M |
| FR-GAME-008 | The system shall visually highlight the winning line when a game is won. | S |
| FR-GAME-009 | The system shall detect a draw when all nine cells are filled with no winning line. | M |
| FR-GAME-010 | The system shall announce the game result (winner or draw) to the player. | M |
| FR-GAME-011 | The system shall provide a "New Game" action that clears the board and starts a fresh game with the current settings. | M |
| FR-GAME-012 | The system shall provide a way to return to setup to change mode/difficulty. | S |

### 3.2 Game Setup & Mode Selection (FR-MODE)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MODE-001 | The system shall let the user choose between "vs. Computer" and "Local Two-Player" before starting a game. | M |
| FR-MODE-002 | The system shall, in vs. Computer mode, let the user select a difficulty of Easy, Medium, or Hard. | M |
| FR-MODE-003 | The system shall, in vs. Computer mode, let the user choose whether they play first (`X`) or second (`O`). | S |
| FR-MODE-004 | The system shall start a game using the selected mode and settings. | M |
| FR-MODE-005 | The system shall remember the most recently used mode and difficulty and default to them on next launch. | C |

### 3.3 Computer Opponent (FR-AI)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-001 | On Easy, the AI shall select a random legal move. | M |
| FR-AI-002 | On Medium, the AI shall take an immediately winning move when available and block an immediate opponent win when present, otherwise move randomly. | M |
| FR-AI-003 | On Hard, the AI shall play optimally (minimax) such that it never loses. | M |
| FR-AI-004 | The system shall make the AI move automatically on its turn, after a brief perceptible delay. | M |
| FR-AI-005 | The AI shall only ever make legal moves on empty cells. | M |

### 3.4 Statistics & Match History (FR-STATS)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-STATS-001 | The system shall maintain running win, loss, and draw counts, segmented by game mode (and difficulty for vs. Computer). | M |
| FR-STATS-002 | The system shall record a match-history entry at the end of each game, capturing result, mode, difficulty (if applicable), and timestamp. | M |
| FR-STATS-003 | The system shall display a statistics summary of win/loss/draw counts. | M |
| FR-STATS-004 | The system shall display the match history as a chronological list. | M |
| FR-STATS-005 | The system shall persist statistics and match history in `localStorage` so they survive browser and tab restarts. | M |
| FR-STATS-006 | The system shall provide an action to clear/reset all statistics and match history, with a confirmation step. | S |
| FR-STATS-007 | The system shall update statistics and history automatically at the moment a game ends. | M |

### 3.5 Theming & Appearance (FR-THEME)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-THEME-001 | The system shall let the user switch between light and dark themes. | M |
| FR-THEME-002 | The system shall default the theme to the user's operating-system/browser color-scheme preference on first load. | S |
| FR-THEME-003 | The system shall persist the user's theme selection in `localStorage`. | S |

### 3.6 General UI & Navigation (FR-UI)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-UI-001 | The system shall present a responsive layout that adapts to desktop and mobile screen sizes. | M |
| FR-UI-002 | The system shall provide navigation between the game screen and the statistics view. | M |
| FR-UI-003 | The system shall require explicit confirmation before any destructive action (e.g., resetting statistics). | S |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)

| ID | Requirement |
|----|-------------|
| NFR-PERF-001 | A human player's move shall be reflected on the board within 100 ms of the click/tap. |
| NFR-PERF-002 | The Hard (minimax) AI shall compute and play its move within 500 ms on a mid-range device. |
| NFR-PERF-003 | The application shall become interactive within 3 s on a standard broadband connection. |

### 4.2 Usability (NFR-USE)

| ID | Requirement |
|----|-------------|
| NFR-USE-001 | A first-time user shall be able to start and play a game without written instructions. |
| NFR-USE-002 | Interactive targets (cells, buttons) shall be at least 44×44 CSS pixels on touch devices. |
| NFR-USE-003 | Game state (whose turn, result) shall be communicated through visible text, not color alone. |

### 4.3 Compatibility (NFR-COMPAT)

| ID | Requirement |
|----|-------------|
| NFR-COMPAT-001 | The application shall function correctly on the two most recent major versions of Chrome, Firefox, Safari, and Edge. |
| NFR-COMPAT-002 | The layout shall remain usable from a 320 px-wide viewport up to large desktop displays. |

### 4.4 Reliability (NFR-REL)

| ID | Requirement |
|----|-------------|
| NFR-REL-001 | The application shall not crash or enter an inconsistent state on any invalid or rapid user input. |
| NFR-REL-002 | If `localStorage` is unavailable or full, the application shall continue to function for the current session, degrading gracefully to non-persistent behavior. |

### 4.5 Security & Privacy (NFR-PRIV)

| ID | Requirement |
|----|-------------|
| NFR-PRIV-001 | The application shall not collect, transmit, or store any personally identifiable information; all data remains on the user's device. |
| NFR-PRIV-002 | The application shall make no outbound network requests during gameplay after the initial asset load. |

### 4.6 Maintainability (NFR-MAINT)

| ID | Requirement |
|----|-------------|
| NFR-MAINT-001 | Core game logic (rules, win detection, AI) shall be implemented independently of the UI/rendering layer to allow isolated testing. |
| NFR-MAINT-002 | Win detection and AI move selection shall be covered by automated unit tests. |

### 4.7 Portability (NFR-PORT)

| ID | Requirement |
|----|-------------|
| NFR-PORT-001 | The application shall be deployable as static files to any static host or CDN, requiring no server-side runtime. |
| NFR-PORT-002 | The application shall be fully functional offline after the initial load. |

### 4.8 Accessibility (NFR-A11Y)

| ID | Requirement |
|----|-------------|
| NFR-A11Y-001 | The application shall follow reasonable best-effort accessibility practices (sufficient color contrast, focus visibility). No formal WCAG conformance level is committed for this release. |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

- **UI-1:** A setup screen for selecting mode, difficulty, and starting a game.
- **UI-2:** A game screen showing the 3×3 board, turn indicator, result banner,
  and New Game / navigation controls.
- **UI-3:** A statistics view showing summary counts and match history, with a
  reset control.
- **UI-4:** A theme toggle accessible from the main interface.

### 5.2 Hardware Interfaces

- Standard pointer (mouse) and touch input; keyboard input is not a committed
  interface for this release.

### 5.3 Software Interfaces

- **SI-1:** Browser `localStorage` API for persistence of stats, history, and
  preferences.
- **SI-2:** Browser `prefers-color-scheme` media feature for default theming.

### 5.4 Communication Interfaces

- None. The application performs no network communication beyond serving its
  own static assets.

---

## 6. Open Questions / TBD

- None outstanding at finalization. All elicited areas are resolved for v1.0.
