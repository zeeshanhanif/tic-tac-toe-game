// NFR-COMPAT-002 — "the layout shall remain usable from a 320 px-wide viewport
// up to large desktop displays", which design.md §3 implements as a single
// fluid column. DEF-007 regression: the top bar did not wrap, so the wordmark
// (~191px) plus the theme toggle (~120px) needed ~328px of a 280px column and
// the page scrolled sideways at the narrowest supported width.

import { test, expect, type Page } from "@playwright/test";

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const offenders: string[] = [];
    if (de.scrollWidth > de.clientWidth) {
      document.querySelectorAll("*").forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.right > de.clientWidth + 0.5) {
          offenders.push(`${n.tagName.toLowerCase()}.${(n as HTMLElement).className || "-"}`);
        }
      });
    }
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, offenders: offenders.slice(0, 5) };
  });
}

async function expectNoOverflow(page: Page, screen: string) {
  const o = await horizontalOverflow(page);
  expect(
    o.scrollW,
    `${screen} scrolls horizontally (${o.scrollW} > ${o.clientW}); overflowing: ${o.offenders.join(", ") || "none"}`,
  ).toBeLessThanOrEqual(o.clientW);
}

// 320px is the floor NFR-COMPAT-002 names. The sheet's only media query is
// `@media (max-width: 360px)`, which is *inclusive* — so 320 and 360 both land
// inside it, and 400px is needed to exercise the branch above it (e.g.
// `.confirm-actions`' two-column row, which only applies over 360px).
for (const width of [320, 360, 400]) {
  test.describe(`NFR-COMPAT-002 — no horizontal overflow at ${width}px (DEF-007)`, () => {
    test.use({ viewport: { width, height: 720 } });

    test(`Setup, Game and Stats all fit at ${width}px`, async ({ page }) => {
      await page.goto("/");
      await expectNoOverflow(page, `Setup (${width}px)`);

      // vs-Computer reveals the difficulty + side controls — the widest Setup.
      await page.getByText("Vs. Computer").click();
      await expectNoOverflow(page, `Setup vs-Computer (${width}px)`);

      await page.getByText("2 Players").click();
      await page.getByRole("button", { name: "Start Game" }).click();
      // Confirm the Game view actually mounted — without this, a regression that
      // made Start Game a no-op would silently re-measure Setup and pass green.
      await expect(page.locator(".board")).toBeVisible();
      await expectNoOverflow(page, `Game (${width}px)`);

      await page.getByRole("button", { name: "View stats & history" }).click();
      await expect(page.getByRole("heading", { name: "Statistics" })).toBeVisible();
      await expectNoOverflow(page, `Stats (${width}px)`);
    });
  });
}
