// DEF-006 regression — the Stats view must never display counts that disagree
// with what is persisted. The Game view arms a 400 ms AI timer; navigating to
// Stats used to leave that timer running on the detached view, so a game could
// finish behind the user and write to the store *after* the Stats view had
// already snapshotted it (FR-STATS-003).
//
// Deterministic line: as X against Hard, cells 0, 1, 3 force O to reply 4, 2, 6
// — O wins on the anti-diagonal on its own move, so the game ends on the AI's
// timer rather than on a human click.

import { test, expect, type Page } from "@playwright/test";
// Imported, not copied: a bumped storage key or a longer AI delay would other-
// wise make these tests pass vacuously instead of failing.
import { STATS_KEY } from "../../src/infra/stats-store.ts";
import { AI_DELAY_MS } from "../../src/ui/views/game.ts";

type WLD = { wins: number; losses: number; draws: number };

async function persistedTotals(page: Page): Promise<WLD & { history: number }> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return { wins: 0, losses: 0, draws: 0, history: 0 };
    const s = JSON.parse(raw) as {
      stats: { twoPlayer: WLD; vsComputer: Record<string, WLD> };
      history: unknown[];
    };
    const all = [s.stats.twoPlayer, ...Object.values(s.stats.vsComputer)];
    return {
      wins: all.reduce((a, b) => a + b.wins, 0),
      losses: all.reduce((a, b) => a + b.losses, 0),
      draws: all.reduce((a, b) => a + b.draws, 0),
      history: s.history.length,
    };
  }, STATS_KEY);
}

async function displayedTotals(page: Page): Promise<WLD> {
  const num = async (label: string) =>
    Number(await page.locator(".tile", { hasText: label }).locator(".num").innerText());
  return { wins: await num("Wins"), losses: await num("Losses"), draws: await num("Draws") };
}

async function startHardGameAndBlunder(page: Page) {
  await page.goto("/");
  await page.getByText("Vs. Computer").click();
  await page.getByRole("button", { name: "Hard" }).click();
  await page.getByRole("button", { name: "Start Game" }).click();

  const cells = page.locator(".cell");
  await cells.nth(0).click(); // O replies 4
  await expect(cells.nth(4)).toHaveText("O");
  await cells.nth(1).click(); // O replies 2
  await expect(cells.nth(2)).toHaveText("O");
  await cells.nth(3).click(); // O's next move (6) wins — armed on a 400ms timer
}

test.describe("DEF-006 — Stats view freshness", () => {
  test("navigating to Stats mid-AI-turn never shows counts that disagree with storage", async ({
    page,
  }) => {
    await startHardGameAndBlunder(page);

    // Leave immediately, inside the AI delay window.
    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();

    // Pin the premise. If navigation ever loses the race with the 400ms timer,
    // the game would already be over on arrival and the rest of this test would
    // pass without exercising anything — a silent no-op guard. Fail loudly.
    expect(
      (await persistedTotals(page)).history,
      "the AI move should still be pending on arrival at Stats — this test's premise",
    ).toBe(0);

    // Wait well past the delay: whatever the app does with the pending move, the
    // rendered tiles and the persisted store must not contradict each other.
    await page.waitForTimeout(AI_DELAY_MS * 3);

    const shown = await displayedTotals(page);
    const stored = await persistedTotals(page);
    expect(
      shown,
      `Stats view shows ${JSON.stringify(shown)} but storage holds ${JSON.stringify(stored)}`,
    ).toEqual({ wins: stored.wins, losses: stored.losses, draws: stored.draws });
  });

  test("the pending AI move resumes on return, and Stats then reflects the finished game", async ({
    page,
  }) => {
    await startHardGameAndBlunder(page);

    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
    expect(
      (await persistedTotals(page)).history,
      "the AI move should still be pending on arrival at Stats — this test's premise",
    ).toBe(0);
    await page.waitForTimeout(AI_DELAY_MS * 3);

    // Back to the same game — the deferred AI move must still happen, or the
    // game would be frozen with no way for the AI to ever take its turn.
    await page.getByRole("button", { name: "‹ Back to game" }).click();
    await expect(page.locator(".cell").nth(6)).toHaveText("O", { timeout: 2000 });

    // Game over: O won, which is a loss from the human's (X) perspective.
    await expect(page.getByText("O wins!")).toBeVisible();

    await page.getByRole("button", { name: "View stats & history" }).click();
    await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
    const shown = await displayedTotals(page);
    const stored = await persistedTotals(page);
    expect(shown.losses, "the finished game should be shown as a loss").toBe(1);
    expect(shown).toEqual({ wins: stored.wins, losses: stored.losses, draws: stored.draws });
    expect(stored.history, "the finished game should be in history").toBe(1);
  });
});
