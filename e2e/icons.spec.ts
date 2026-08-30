import { expect, test } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * The density rule, as a number rather than as a paragraph.
 *
 * `docs/visual-design.md`, "What stops a mark becoming a sticker": one mark per surface, and the
 * domain marks are the classifier exception that repeats down a list on purpose. Both halves are
 * only checkable against what actually renders — a source sweep cannot count what a component put
 * on a row.
 */
test.describe('icons', () => {
  test('gives a tool row one mark and no more', async ({ page }) => {
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    const rows = page.locator('.all-tools__tool');
    const count = await rows.count();
    expect(count, 'the catalog rendered no tools').toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const marks = rows.nth(index).locator('.icon');
      await expect(marks, 'a tool row carries more than one mark').toHaveCount(1);
    }
  });

  test('hides every mark from the accessibility tree', async ({ page }) => {
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    // Thirty-four rows, each classified by a domain the heading above it already states. A mark
    // that announced itself would be thirty-four unskippable "image"s between a reader and the
    // list they came for.
    const marks = page.locator('.all-tools__list .icon');
    const total = await marks.count();
    expect(total, 'nothing was marked').toBeGreaterThan(0);

    for (let index = 0; index < total; index += 1) {
      await expect(marks.nth(index)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('recedes rather than competing with the label it classifies', async ({ page }) => {
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    // A mark is never the brightest thing on its surface. It shipped inheriting the link's accent
    // green the first time, which is a mark competing with the label beside it; `Icon` decides this
    // from the same `label`-or-not that makes it a mark at all.
    const paint = await page
      .locator('.all-tools__tool .icon')
      .first()
      .evaluate((element) => {
        const row = element.closest('a');
        return {
          mark: getComputedStyle(element).color,
          label: row === null ? '' : getComputedStyle(row).color,
        };
      });

    expect(paint.mark, 'the mark takes the label’s own colour').not.toBe(paint.label);
  });
});
