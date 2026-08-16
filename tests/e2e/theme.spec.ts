// FEAT-007 — light/dark theming (UC-08). FR-THEME-001/002/003.
// Not a critical flow (architecture §8) — a focused feature test: the toggle
// switches instantly + persists across reload, and is present on every screen.
// Each Playwright test starts with an isolated (empty) storage context.

import { test, expect } from "@playwright/test";

const html = (p: import("@playwright/test").Page) => p.locator("html");

test.describe("FEAT-007 — theming", () => {
  test("toggle switches the theme instantly and persists across reload", async ({ page }) => {
    await page.goto("/");

    // First load, no saved choice → OS default (light in headless Chromium). (AC-3)
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    // Toggle to dark → applies immediately (AC-1) and persists (AC-4).
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    const saved = await page.evaluate(() => localStorage.getItem("ttt:theme:v1"));
    expect(saved).toBe('"dark"'); // StorageRepo JSON-stringifies the value

    // Reload → the chosen theme is re-applied before paint (AC-4).
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    // Back to light also persists (AC-1).
    await page.getByRole("button", { name: "Light" }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
  });

  // DEF-004 regression: the explicit choice must reach UA-rendered chrome
  // (scrollbars, pre-paint canvas), not just the token palette. A `color-scheme`
  // left at `light dark` lets the UA keep resolving from prefers-color-scheme,
  // so a dark page on a light-mode OS gets light scrollbars (FR-THEME-001).
  const colorScheme = (p: import("@playwright/test").Page) =>
    p.evaluate(() => getComputedStyle(document.documentElement).colorScheme);

  test("an explicit theme choice narrows color-scheme for UA chrome (DEF-004)", async ({
    page,
  }) => {
    // Light-mode OS, user chooses Dark → UA must render dark chrome.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Dark" }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    expect(await colorScheme(page)).toBe("dark");

    // Dark-mode OS, user chooses Light → the inverse must hold.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.getByRole("button", { name: "Light" }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    expect(await colorScheme(page)).toBe("light");

    // No explicit choice → the UA default stays responsive to the OS (AC-3).
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "dark"); // OS default
    expect(await colorScheme(page)).toBe("dark");
  });

  test("the theme toggle is present on every screen (AC-2)", async ({ page }) => {
    await page.goto("/");

    // Setup
    await expect(page.getByRole("button", { name: "Light" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();

    // Game
    await page.getByText("2 Players").click();
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(page.getByRole("button", { name: "Light" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();

    // Stats
    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Light" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
  });
});
