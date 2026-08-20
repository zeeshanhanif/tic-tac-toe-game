// NFR-USE-002 — interactive targets are at least 44×44 CSS pixels.
// design.md §9 rule 4 applies this to *all* controls, and rule 3 names the
// toggle and links as controls. DEF-005 regression: the theme-toggle segments
// and the footer stats link shipped without `min-height`, unlike every other
// control in the sheet.

import { test, expect } from "@playwright/test";

const MIN = 44; // --layout-touchTargetMin

async function expectMinTarget(locator: import("@playwright/test").Locator, label: string) {
  await expect(locator, `${label} should be visible`).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} has no bounding box`).not.toBeNull();
  expect(
    Math.round(box!.height),
    `${label} height ${box!.height}px is below the ${MIN}px touch minimum (NFR-USE-002)`,
  ).toBeGreaterThanOrEqual(MIN);
  expect(
    Math.round(box!.width),
    `${label} width ${box!.width}px is below the ${MIN}px touch minimum (NFR-USE-002)`,
  ).toBeGreaterThanOrEqual(MIN);
}

test.describe("NFR-USE-002 — touch targets (DEF-005)", () => {
  test("the theme toggle segments meet the 44px minimum on every screen", async ({ page }) => {
    await page.goto("/");

    // Setup
    await expectMinTarget(page.getByRole("button", { name: "Light" }), "Setup: Light segment");
    await expectMinTarget(page.getByRole("button", { name: "Dark" }), "Setup: Dark segment");

    // Game
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await expectMinTarget(page.getByRole("button", { name: "Light" }), "Game: Light segment");
    await expectMinTarget(page.getByRole("button", { name: "Dark" }), "Game: Dark segment");

    // Stats
    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
    await expectMinTarget(page.getByRole("button", { name: "Light" }), "Stats: Light segment");
    await expectMinTarget(page.getByRole("button", { name: "Dark" }), "Stats: Dark segment");
  });

  test("the footer stats link meets the 44px minimum on Setup and Game", async ({ page }) => {
    await page.goto("/");

    await expectMinTarget(
      page.getByRole("button", { name: "View stats & history" }),
      "Setup: stats link",
    );

    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await expectMinTarget(
      page.getByRole("button", { name: "View stats & history" }),
      "Game: stats link",
    );
  });
});
