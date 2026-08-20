// NFR-USE-002 — interactive targets are at least 44×44 CSS pixels.
// design.md §9 rule 4 applies this to *all* controls, and rule 3 names the
// toggle and links as controls. DEF-005 regression: the theme-toggle segments
// and the footer stats link shipped without `min-height`, unlike every other
// control in the sheet.

import { test, expect, type Page, type Locator } from "@playwright/test";

const MIN = 44; // --layout-touchTargetMin

// Compare the raw float, never a rounded value: Math.round(43.5) === 44 would
// let a target land half a pixel under the floor and still pass.
async function expectMinTarget(locator: Locator, label: string) {
  await expect(locator, `${label} should be visible`).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} has no bounding box`).not.toBeNull();
  expect(box!.height, `${label} height is ${box!.height}px, under the ${MIN}px floor`).
    toBeGreaterThanOrEqual(MIN);
  expect(box!.width, `${label} width is ${box!.width}px, under the ${MIN}px floor`).
    toBeGreaterThanOrEqual(MIN);
}

const toggle = (p: Page, name: "Light" | "Dark") => p.getByRole("button", { name });
const statsLink = (p: Page) => p.getByRole("button", { name: "View stats & history" });

async function startTwoPlayerGame(page: Page) {
  await page.getByText("2 Players").click();
  await page.getByRole("button", { name: "Start Game" }).click();
}

// The whole assertion sweep, run once per viewport class below.
async function assertAllTargets(page: Page, at: string) {
  await page.goto("/");
  await expectMinTarget(toggle(page, "Light"), `${at} Setup: Light segment`);
  await expectMinTarget(toggle(page, "Dark"), `${at} Setup: Dark segment`);
  await expectMinTarget(statsLink(page), `${at} Setup: stats link`);

  await startTwoPlayerGame(page);
  await expectMinTarget(toggle(page, "Light"), `${at} Game: Light segment`);
  await expectMinTarget(toggle(page, "Dark"), `${at} Game: Dark segment`);
  await expectMinTarget(statsLink(page), `${at} Game: stats link`);

  await statsLink(page).click();
  await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
  await expectMinTarget(toggle(page, "Light"), `${at} Stats: Light segment`);
  await expectMinTarget(toggle(page, "Dark"), `${at} Stats: Dark segment`);
}

test.describe("NFR-USE-002 — touch targets (DEF-005)", () => {
  test("toggle segments and stats link meet the 44px floor (desktop)", async ({ page }) => {
    await assertAllTargets(page, "desktop");
  });

  // NFR-USE-002 is specifically about *touch devices*, and the suite's only
  // Playwright project is Desktop Chrome — so without this block a regression
  // that only appears at a mobile viewport (e.g. a new rule inside the
  // `@media (max-width: 360px)` block trimming padding) would slip through the
  // very guard written to prevent it.
  test.describe("on a touch viewport", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test("toggle segments and stats link meet the 44px floor (mobile)", async ({ page }) => {
      await assertAllTargets(page, "mobile-390");
    });
  });

  // 360px is the breakpoint the sheet actually reacts to; 320px is the narrowest
  // viewport NFR-COMPAT-002 supports. Targets must hold at both.
  test.describe("at the narrowest supported viewport", () => {
    test.use({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true });

    test("toggle segments and stats link meet the 44px floor (320px)", async ({ page }) => {
      await assertAllTargets(page, "mobile-320");
    });
  });
});
