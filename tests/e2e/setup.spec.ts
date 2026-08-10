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

test.describe("Setup — remember last settings (FEAT-008)", () => {
  test("defaults to the last-used mode + difficulty across reload, and starts with them", async ({
    page,
  }) => {
    await page.goto("/");

    // Start a vs-Computer / Hard game (non-default settings).
    await page.getByText("Vs. Computer").click();
    await page.getByRole("button", { name: "Hard" }).click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(page.getByText("Hard AI")).toBeVisible();

    // Reload → Setup defaults to the remembered settings (AC-1, AC-2).
    await page.reload();
    await expect(page.locator(".mode.sel")).toContainText("Vs. Computer");
    await expect(page.locator(".seg .on")).toHaveText("Hard");
    await expect(page.getByText("Difficulty")).toBeVisible();

    // Accept and start immediately → a vs-Computer / Hard game (UC-01 2a, AC-4).
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(page.getByText("Computer", { exact: true })).toBeVisible();
    await expect(page.getByText("Hard AI")).toBeVisible();
  });
});
