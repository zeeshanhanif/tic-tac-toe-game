// CF-1 — "Play a game" UI/E2E smoke (architecture §8 Testing, ADR-006).
// Realizes UC-01..UC-05 end-to-end in a real browser. Thin happy-path smoke:
// configure → play → reach a win and a draw → New Game / Menu. Asserts on
// roles/text, not pixels. Backfill for the flow shipped by FEAT-001/002.

import { test, expect } from "@playwright/test";

test.describe("CF-1 — Play a game", () => {
  test("two-player game plays to an X win, then Play Again resets", async ({ page }) => {
    await page.goto("/");
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();

    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // X:0 O:3 X:1 O:4 X:2 → X wins the top row
    for (const i of [0, 3, 1, 4, 2]) await cells.nth(i).click();

    await expect(page.getByText("X wins!")).toBeVisible();

    await page.getByRole("button", { name: "Play Again" }).click();
    await expect(page.getByText("X wins!")).toHaveCount(0);
    await expect(page.getByText("X's turn")).toBeVisible();
  });

  test("two-player game can end in a draw", async ({ page }) => {
    await page.goto("/");
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();

    const cells = page.getByRole("gridcell");
    // Fills the board with no line: X O X / X O O / O X X
    for (const i of [0, 1, 2, 4, 3, 5, 7, 6, 8]) await cells.nth(i).click();

    await expect(page.getByText("Draw")).toBeVisible();
  });

  test("vs-Computer (Easy): the AI auto-moves on its turn", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Vs. Computer").click();
    await page.getByRole("button", { name: "Easy" }).click();
    await page.getByRole("button", { name: "Start Game" }).click();

    // vs-computer scoreboard label
    await expect(page.getByText("Computer", { exact: true })).toBeVisible();

    const cells = page.getByRole("gridcell");
    await cells.nth(0).click(); // human X

    // After the delay the AI (O) plays exactly one legal move — one O appears.
    await expect(page.getByRole("gridcell", { name: /, O/ })).toHaveCount(1, { timeout: 5000 });
  });

  test("Menu returns to Setup", async ({ page }) => {
    await page.goto("/");
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  });
});
