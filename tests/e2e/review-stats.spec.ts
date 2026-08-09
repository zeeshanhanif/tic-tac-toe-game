// CF-2 — "Review statistics" UI/E2E smoke (architecture §8 Testing, ADR-006).
// Realizes UC-06. Play a game → open stats → the summary + history reflect it →
// filter by mode → back preserves the game. Reset (the rest of CF-2) is FEAT-006.
// Each Playwright test starts with an isolated (empty) storage context.

import { test, expect } from "@playwright/test";

test.describe("CF-2 — Review statistics", () => {
  test("stats reflect a played game; filter + back work", async ({ page }) => {
    await page.goto("/");

    // Play a 2-player game to an X win.
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    const cells = page.getByRole("gridcell");
    for (const i of [0, 3, 1, 4, 2]) await cells.nth(i).click();
    await expect(page.getByText("X wins!")).toBeVisible();

    // Open the stats view.
    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();

    // Summary + history reflect the win (FR-STATS-003/004).
    await expect(page.locator(".tile.win .num")).toHaveText("1");
    await expect(page.locator(".history .mt").first()).toHaveText("2 Players");
    await expect(page.locator(".rbadge.win")).toBeVisible();

    // Filter to Vs. Computer → zeroed + empty state (FR-STATS-003/004 segmentation).
    await page.getByRole("button", { name: "Vs. Computer" }).click();
    await expect(page.locator(".tile.win .num")).toHaveText("0");
    await expect(page.getByText("Play a game to see it here.")).toBeVisible();

    // Back returns to the preserved game (FR-UI-002, D1).
    await page.getByRole("button", { name: "Back to game" }).click();
    await expect(page.getByText("X wins!")).toBeVisible();
  });

  test("empty stats show zeroed tiles and an empty history", async ({ page }) => {
    await page.goto("/");
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await page.getByRole("button", { name: "View stats & history" }).click();

    await expect(page.locator(".tile.win .num")).toHaveText("0");
    await expect(page.locator(".tile.loss .num")).toHaveText("0");
    await expect(page.locator(".tile.draw .num")).toHaveText("0");
    await expect(page.getByText("No games yet")).toBeVisible();
    await expect(page.getByText("Play a game to see it here.")).toBeVisible();
  });
});
