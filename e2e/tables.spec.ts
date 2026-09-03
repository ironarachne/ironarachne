import { expect, test } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * A table that flips keeps every key.
 *
 * `docs/visual-design.md`, "The phone answer, which is where the two halves meet". Below 640px a
 * flipping table hides its head and each cell takes its key from `data-label`, so a cell that
 * forgot its label would lose that key silently — on exactly the screens nobody checks by hand.
 * `DataTable` writes the labels from its columns, and this is what holds it to that.
 *
 * Desktop-only as a project: the assertion is about a viewport, so it sets its own.
 */
test.describe('a flipped table', () => {
  test('shows one key per column it had', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await visitRoute(page, '/fantasy/equipment', {
      title: 'Fantasy Equipment Price Lists | Iron Arachne',
    });

    const rows = page.locator('.data-table tbody tr');
    await expect(rows.first()).toBeVisible();

    // Every cell in the first row carries a key, and the keys are the columns' own labels.
    const keys = await rows.first().evaluate((row) =>
      [...row.querySelectorAll('td')].map((cell) => ({
        label: cell.getAttribute('data-label'),
        shown: globalThis.getComputedStyle(cell, '::before').content,
      })),
    );

    expect(keys.length, 'the row rendered no cells').toBeGreaterThan(0);
    for (const key of keys) {
      expect(key.label, 'a cell has no key to show when it flips').not.toBeNull();
      expect(key.shown, `the key for ${key.label} is not painted`).toContain(key.label ?? '');
    }
  });

  test('does not scroll the page sideways', async ({ page }) => {
    // The whole reason the flip exists. `pages.mobile.spec.ts` checks this for every route; this
    // checks the mechanism itself, on the narrowest width the app supports.
    await page.setViewportSize({ width: 320, height: 800 });
    await visitRoute(page, '/fantasy/equipment', {
      title: 'Fantasy Equipment Price Lists | Iron Arachne',
    });

    const overflow = await page.evaluate(() => {
      const region = document.querySelector('main.shell__page');
      return region === null ? 0 : region.scrollWidth - region.clientWidth;
    });

    expect(overflow, 'the page scrolls sideways').toBeLessThanOrEqual(0);
  });
});
