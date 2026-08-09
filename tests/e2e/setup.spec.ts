// Setup-screen control visibility (regression guard for DEF-001).
// Two-player mode must hide the vs-Computer-only Difficulty + "You play as"
// controls; vs-Computer must reveal them.

import { test, expect } from "@playwright/test";

test.describe("Setup — mode-gated controls (DEF-001)", () => {
  test("two-player hides the Difficulty control; Vs. Computer reveals it", async ({ page }) => {
    await page.goto("/");

    // Default is 2 Players → difficulty/side controls hidden.
    await page.getByText("2 Players").click();
    await expect(page.getByText("Difficulty")).toBeHidden();
    await expect(page.getByText("You play as")).toBeHidden();

    // Vs. Computer → controls revealed.
    await page.getByText("Vs. Computer").click();
    await expect(page.getByText("Difficulty")).toBeVisible();
    await expect(page.getByText("You play as")).toBeVisible();

    // Back to 2 Players → hidden again.
    await page.getByText("2 Players").click();
    await expect(page.getByText("Difficulty")).toBeHidden();
  });
});
