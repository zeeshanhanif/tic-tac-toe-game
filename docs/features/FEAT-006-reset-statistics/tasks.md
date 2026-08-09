# Tasks: FEAT-006 — Reset statistics

> Design: technical-design.md · UI: ui-design.md (SCR-WEB-005)
> Implements FR-STATS-006 (S), FR-UI-003 (S) · UC-07 · completes CF-2.
> Ordered infra → UI component → wiring → E2E. Each task: implement + verify
> (run it), then commit. Do not weaken/skip tests to pass.

- [x] **T1 — `statsStore.reset()` (infra).** Add `reset(): StatsState` to
  `StatsStore` in `src/infra/stats-store.ts`: set `state = emptyStatsState()`,
  `repo.save(STATS_KEY, state)`, return it. (Design §3.1, §7 D3.)
  - **Done when:** new Vitest cases in `src/infra/stats-store.test.ts` pass:
    (a) after recording games then `reset()`, `snapshot()` is zeroed with empty
    history; (b) a fresh store over the same backend loads zeroed data
    (persisted). `npm test` green. **Serves AC-3, AC-5.**

- [x] **T2 — Confirm dialog component (`ui/views/confirm-dialog.ts`).** New
  reusable `openConfirmDialog(opts)` using native `<dialog>` + `showModal()`
  (Design §3.2, §7 D2): title, body, danger confirm + ghost cancel buttons;
  Esc / backdrop / cancel close without `onConfirm`; confirm calls `onConfirm`
  then closes. Add dialog + danger-button styles to `src/style.css` from tokens
  **per ui-design's SCR-WEB-005 spec** (do not hand-copy token values).
  - **Done when:** the component builds, `npm run lint` passes (module
    boundaries clean — `ui/` only), and a manual/browser check shows the modal
    opens, Esc cancels, focus is trapped. **Serves AC-2, AC-6.**

- [x] **T3 — Wire reset into the Stats view (`ui/views/stats.ts`).** Add the
  danger **"Reset all statistics"** control (placement per SCR-WEB-005). On
  activate → `openConfirmDialog({ …, onConfirm: doReset })`; `doReset` calls
  `statsStore.reset()`, re-reads `snapshot()` into the view's state (D1), and
  re-renders (zeroed tiles + empty history). (Design §3.3, §7 D1.)
  - **Done when:** `npm run build` (tsc) + `npm run lint` pass; in-browser: reset
    → confirm shows zeroed data; cancel/Esc leaves stats unchanged.
    **Serves AC-1, AC-3, AC-4.**

- [ ] **T4 — Extend the CF-2 E2E smoke (`tests/e2e/review-stats.spec.ts`).** Add
  the reset segment (Design §7 D4, ADR-006): play a game → open stats →
  Reset all statistics → **cancel** ⇒ counts unchanged; → **confirm** ⇒ tiles
  `0` + empty-history state. Assert on stable roles/text, keep it smoke.
  - **Done when:** `npx playwright test review-stats` (or `npm run test:e2e`)
    passes headless, including the new reset cases. **Serves AC-2, AC-3, AC-4.**

- [ ] **T5 — Verification task (feature done-check).** Run the full suites fresh:
  `npm test` (unit, incl. T1), `npm run build`, `npm run lint`, and the
  Playwright E2E. Confirm every AC-1..AC-6 is demonstrated by a passing test or
  a recorded in-browser observation. Fix any red; no skips/weakenings.
  - **Done when:** all suites green; AC coverage table checked;
    FEAT-006 is developer-done and ready for acceptance-verification.

## AC → task coverage

| AC | Requirement | Task(s) |
| :- | :---------- | :------ |
| AC-1 | FR-STATS-006 / UC-07.1 — reset action present | T3 |
| AC-2 | FR-UI-003 / UC-07.2 — confirm before change | T2, T3, T4 |
| AC-3 | FR-STATS-006 / UC-07.3–4 — confirm clears, zeroed | T1, T3, T4 |
| AC-4 | UC-07 3a / FR-UI-003 — cancel is a no-op | T3, T4 |
| AC-5 | FR-STATS-006 / NFR-REL-002 — reset persists | T1 |
| AC-6 | FR-UI-003 / a11y — focus-trap, Esc, label-not-colour | T2 |
</content>
