# Requirements Traceability Matrix — Tic-Tac-Toe Game

- **Version:** 1.0
- **Date:** 2026-07-09
- **Companion to:** `docs/srs.md`, `docs/use-cases.md`

Design, Code, and Test columns are placeholders to be filled by the downstream
architecture, implementation, and QA phases.

## Functional Requirements

| Req ID | Description (abbrev.) | Priority | Source | Use Case(s) | Plan ref | Design | Code | Test |
|--------|-----------------------|----------|--------|-------------|----------|--------|------|------|
| FR-GAME-001 | Display 3×3 board | M | Elicitation | UC-01 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-002 | Place mark on empty cell | M | Elicitation | UC-02 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-003 | Reject move on occupied cell | M | Elicitation | UC-02 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-004 | Reject move after game over | M | Elicitation | UC-02 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-005 | Alternate turns, X first | M | Elicitation | UC-02 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-006 | Show current-turn indicator | M | Elicitation | UC-02 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-007 | Detect win (row/col/diag) | M | Elicitation | UC-04 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-008 | Highlight winning line | S | Elicitation | UC-04 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-009 | Detect draw | M | Elicitation | UC-04 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-010 | Announce result | M | Elicitation | UC-04 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-011 | New Game action | M | Elicitation | UC-05 | FEAT-001 | TBD | TBD | TBD |
| FR-GAME-012 | Return to setup | S | Elicitation | UC-05 | FEAT-001 | TBD | TBD | TBD |
| FR-MODE-001 | Choose mode | M | Elicitation | UC-01 | FEAT-001, FEAT-002 | TBD | TBD | TBD |
| FR-MODE-002 | Choose AI difficulty | M | Elicitation | UC-01 | FEAT-002 | TBD | TBD | TBD |
| FR-MODE-003 | Choose to play first/second | S | Elicitation | UC-01 | FEAT-002 | TBD | TBD | TBD |
| FR-MODE-004 | Start game with settings | M | Elicitation | UC-01 | FEAT-001, FEAT-002 | TBD | TBD | TBD |
| FR-MODE-005 | Remember last settings | C | Elicitation | UC-01 | FEAT-008 | TBD | TBD | TBD |
| FR-AI-001 | Easy: random move | M | Elicitation | UC-03 | FEAT-002 | TBD | TBD | TBD |
| FR-AI-002 | Medium: win/block else random | M | Elicitation | UC-03 | FEAT-002 | TBD | TBD | TBD |
| FR-AI-003 | Hard: optimal minimax | M | Elicitation | UC-03 | FEAT-003 | TBD | TBD | TBD |
| FR-AI-004 | AI auto-moves with delay | M | Elicitation | UC-03 | FEAT-002 | TBD | TBD | TBD |
| FR-AI-005 | AI plays only legal moves | M | Elicitation | UC-03 | FEAT-002 | TBD | TBD | TBD |
| FR-STATS-001 | Track W/L/D per mode | M | Elicitation | UC-04 | FEAT-004 | TBD | TBD | TBD |
| FR-STATS-002 | Record match-history entry | M | Elicitation | UC-04 | FEAT-004 | TBD | TBD | TBD |
| FR-STATS-003 | Display stats summary | M | Elicitation | UC-06 | FEAT-005 | TBD | TBD | TBD |
| FR-STATS-004 | Display match history | M | Elicitation | UC-06 | FEAT-005 | TBD | TBD | TBD |
| FR-STATS-005 | Persist stats in localStorage | M | Elicitation | UC-06 | FEAT-004 | TBD | TBD | TBD |
| FR-STATS-006 | Reset stats with confirmation | S | Elicitation | UC-07 | FEAT-006 | TBD | TBD | TBD |
| FR-STATS-007 | Update stats at game end | M | Elicitation | UC-04 | FEAT-004 | TBD | TBD | TBD |
| FR-THEME-001 | Toggle light/dark | M | Elicitation | UC-08 | FEAT-007 | TBD | TBD | TBD |
| FR-THEME-002 | Default to OS color scheme | S | Elicitation | UC-08 | FEAT-007 | TBD | TBD | TBD |
| FR-THEME-003 | Persist theme choice | S | Elicitation | UC-08 | FEAT-007 | TBD | TBD | TBD |
| FR-UI-001 | Responsive layout | M | Elicitation | UC-01..08 | Foundations | TBD | TBD | TBD |
| FR-UI-002 | Navigate game ↔ stats | M | Elicitation | UC-06 | FEAT-005 | TBD | TBD | TBD |
| FR-UI-003 | Confirm destructive actions | S | Elicitation | UC-07 | FEAT-006 | TBD | TBD | TBD |

## Non-Functional Requirements

| Req ID | Description (abbrev.) | Category | Source | Verification | Plan ref | Design | Code | Test |
|--------|-----------------------|----------|--------|--------------|----------|--------|------|------|
| NFR-PERF-001 | Move reflected < 100 ms | Performance | Elicitation | Measurement | FEAT-001 | TBD | TBD | TBD |
| NFR-PERF-002 | Hard AI move < 500 ms | Performance | Elicitation | Measurement | FEAT-003 | TBD | TBD | TBD |
| NFR-PERF-003 | Interactive < 3 s | Performance | Elicitation | Measurement | Foundations | TBD | TBD | TBD |
| NFR-USE-001 | Playable without instructions | Usability | Elicitation | Inspection | FEAT-001 | TBD | TBD | TBD |
| NFR-USE-002 | Touch targets ≥ 44 px | Usability | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-USE-003 | State not conveyed by color alone | Usability | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-COMPAT-001 | Latest 2 versions major browsers | Compatibility | Elicitation | Test | Foundations | TBD | TBD | TBD |
| NFR-COMPAT-002 | Usable 320 px → desktop | Compatibility | Elicitation | Test | Foundations | TBD | TBD | TBD |
| NFR-REL-001 | No crash on invalid/rapid input | Reliability | Elicitation | Test | FEAT-001 | TBD | TBD | TBD |
| NFR-REL-002 | Graceful if localStorage absent | Reliability | Elicitation | Test | FEAT-004 | TBD | TBD | TBD |
| NFR-PRIV-001 | No PII collected/transmitted | Privacy | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-PRIV-002 | No network calls during play | Privacy | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-MAINT-001 | Logic decoupled from UI | Maintainability | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-MAINT-002 | Unit tests for win detection & AI | Maintainability | Elicitation | Test | Foundations | TBD | TBD | TBD |
| NFR-PORT-001 | Deployable as static files | Portability | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
| NFR-PORT-002 | Functional offline after load | Portability | Elicitation | Test | Foundations | TBD | TBD | TBD |
| NFR-A11Y-001 | Best-effort accessibility | Accessibility | Elicitation | Inspection | Foundations | TBD | TBD | TBD |
