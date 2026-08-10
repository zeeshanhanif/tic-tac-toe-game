# Tasks: FEAT-008 — Remember last mode/difficulty

> Design: technical-design.md · UI: ui-design.md (SCR-WEB-001 remembered-defaults)
> Implements FR-MODE-005 (C) · UC-01 alt 2a. Ordered store → wiring → E2E → verify.
> Each task: implement + run its done-when, then commit. Never weaken/skip tests.

- [x] **T1 — Last-used settings store (`ui/last-settings.ts`).** Add
  `LastSettings`, `SETTINGS_KEY`, pure `parseLastSettings(raw)`, and
  `loadLastSettings()` / `saveLastSettings()` over `createStorageRepo()`
  (Design §3.1, §7 D3).
  - **Done when:** new Vitest suite `src/ui/last-settings.test.ts` covers
    `parseLastSettings`: valid mode+difficulty round-trips; missing/unknown enum
    /non-object → `null`; and a save→load round-trip over a fake backend returns
    the settings. `npm test` green, `npm run lint` clean (ui→infra only).
    **Serves AC-2, AC-3.**

- [x] **T2 — Seed defaults + persist on start (`ui/views/setup.ts`).** On mount,
  initialize `mode`/`difficulty` from `loadLastSettings()` (fallback
  two-player/medium); on Start, `saveLastSettings({ mode, difficulty })` before
  `onStart` (Design §3.2, §7 D1/D2). `humanMark` unchanged.
  - **Done when:** `npm run build` (tsc) + `npm run lint` pass; in-browser: start
    a vs-Computer/Hard game, return to Setup (Menu) → mode+difficulty are
    pre-selected. **Serves AC-1, AC-4.**

- [x] **T3 — Feature E2E (`tests/e2e/setup.spec.ts`, extend).** Add a
  remember-settings test (Design §8): start a vs-Computer + Hard game, then
  `page.reload()` → Setup defaults to Vs. Computer with Hard selected, and
  pressing Start immediately begins a vs-Computer/Hard game (AC-1/AC-2/AC-4).
  - **Done when:** `npx playwright test setup` passes headless; full E2E suite
    still green. **Serves AC-1, AC-2, AC-4.**

- [ ] **T4 — Verification task (feature done-check).** Run fresh: `npm test`,
  `npm run build`, `npm run lint`, `npx playwright test`. Confirm AC-1..AC-4 each
  demonstrated by a passing test or recorded in-browser observation (AC-3
  corrupt-data path — `parseLastSettings` unit + StorageRepo fallback). Fix any
  red; no skips/weakenings.
  - **Done when:** all suites green; AC coverage table checked; FEAT-008
    developer-done, ready for acceptance-verification. **This completes the plan.**

## AC → task coverage

| AC | Requirement | Task(s) |
| :- | :---------- | :------ |
| AC-1 | FR-MODE-005 / UC-01 2a — defaults reflect last-used | T2, T3 |
| AC-2 | FR-MODE-005 — persist across reload | T1, T3 |
| AC-3 | FR-MODE-005 / NFR-REL-002 — graceful fallback | T1 |
| AC-4 | UC-01 2a — accept remembered + start immediately | T2, T3 |
</content>
