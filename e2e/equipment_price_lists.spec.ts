import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * The fantasy equipment price lists, as a reader meets them (#65).
 *
 * A reference tool produces no artifacts, so there is no generate/save/reopen/edit journey to
 * cover and requirement 7.4 does not bind. What is left is the half the unit tests cannot settle:
 * the page renders the same document the exports write, the same component works on its own route
 * and in a panel (2.1), and the controls can be reached and used by name (6.2).
 *
 * 6.1 is covered where it always was — `e2e/tables.spec.ts` for the mechanism and
 * `e2e/pages.mobile.spec.ts` for every width in `MOBILE_VIEWPORTS`.
 */

const TITLE = 'Fantasy Equipment Price Lists | Iron Arachne';

const costCells = (page: Page) => page.locator('.data-table td.numeric');

async function openPriceLists(page: Page): Promise<void> {
  await visitRoute(page, '/fantasy/equipment', { title: TITLE });
  await expect(page.locator('.equipment-list').first()).toBeVisible();
}

test.describe('the fantasy equipment price lists', () => {
  test('quotes every price in a coin its key explains', async ({ page }) => {
    // The failure this replaces: the key listed electrum, platinum and a crown, none of which any
    // price was ever quoted in, while English prices came back in guineas, which it never
    // mentioned. Both halves now come from the same currency, so the page can be read.
    await openPriceLists(page);

    const key = page.locator('.legend');
    await expect(key).toContainText('cp');
    await expect(key).toContainText('gp');
    await expect(key).not.toContainText('electrum');
    await expect(key).not.toContainText('platinum');

    const dndCosts = (await costCells(page).allInnerTexts()).join('\n');
    expect(dndCosts).not.toContain('ep');
    expect(dndCosts).not.toContain('pp');

    await page.getByLabel('Currency Type').selectOption({ label: 'English currency' });
    await expect(key).toContainText('farthing');
    await expect(key).toContainText('pound');

    const englishCosts = (await costCells(page).allInnerTexts()).join('\n');
    expect(englishCosts).not.toContain('guinea');
    // The farthing has no symbol in `$lib/currency`, so it used to print its name in a column of
    // `cp` and `sp`; the display system gives it the `f` the key has always promised.
    expect(englishCosts).not.toContain('farthing');
    expect(englishCosts).toMatch(/\d f\b/);
  });

  test('never leaves a cost blank', async ({ page }) => {
    // Requirement 6.4. The club, the quarterstaff and the sling stone cost nothing, and
    // `valueToString(0)` is the empty string, so three rows used to show an empty Cost cell.
    await openPriceLists(page);

    const costs = await costCells(page).allInnerTexts();
    expect(costs.length).toBeGreaterThan(400);
    for (const cost of costs) {
      expect(cost.trim()).not.toBe('');
    }
    expect(costs.some((cost) => cost.trim() === 'Free')).toBe(true);
  });

  test('narrows five hundred rows to the ones a reader asked for', async ({ page }) => {
    await openPriceLists(page);
    const count = page.getByRole('status');
    await expect(count).toContainText('categories');

    await page.getByLabel('Search').fill('rope');
    await expect(count).toContainText('match');

    // Every row left names what was searched for, and a category with nothing left is gone
    // rather than showing an empty table.
    const names = await page.locator('.data-table td:not(.numeric)').allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain('rope');
    }
    await expect(page.locator('.equipment-list')).toHaveCount(
      await page.locator('.data-table').count(),
    );

    await page.getByLabel('Search').fill('');
    await expect(count).toContainText('categories');
  });

  test('downloads the list a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first export this page has ever had.
    await openPriceLists(page);
    await page.getByLabel('Search').fill('rope');

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toBe('fantasy-equipment-prices-dnd.md');

    // What was downloaded is what was on screen: the filtered rows, priced in the chosen currency.
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain('# Fantasy Equipment Price Lists');
    expect(contents).toContain('Prices in D&D currency.');
    expect(contents).toContain('rope');
    expect(contents).not.toContain('| longsword |');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toBe('fantasy-equipment-prices-dnd.pdf');
  });

  test('names the currency the export is priced in', async ({ page }) => {
    await openPriceLists(page);
    await page.getByLabel('Currency Type').selectOption({ label: 'English currency' });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toBe('fantasy-equipment-prices-english.md');
    expect(await new Response(await file.createReadStream()).text()).toContain(
      'Prices in English currency.',
    );
  });

  test('is reachable and operable by keyboard, with headed columns', async ({ page }) => {
    // Requirement 6.2. The controls are found by their accessible names throughout this file;
    // what is asserted here is that they can be reached without a pointer, and that a column of
    // numbers announces what it is.
    await openPriceLists(page);

    await page.getByLabel('Currency Type').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Search')).toBeFocused();
    await page.keyboard.type('rope');
    await expect(page.getByRole('status')).toContainText('match');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeFocused();

    // `toHaveText` reads textContent, which is the name a screen reader gets; `innerText` would
    // return what the stylesheet uppercases it to.
    const headers = page.locator('.data-table').first().locator('thead th');
    await expect(headers).toHaveText(['Item', 'Cost']);
    await expect(headers.first()).toHaveAttribute('scope', 'col');
    await expect(headers.nth(1)).toHaveAttribute('scope', 'col');
  });

  test('works the same mounted in a workshop panel', async ({ page }) => {
    // Requirement 2.1. The panel registry points at the same component the route mounts, and this
    // is what says the page does not quietly depend on being a page.
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Fantasy Equipment Price Lists/ })
      .click();

    const panel = page.locator('section.workshop-panel');
    await expect(panel.locator('.panel__title')).toContainText('Fantasy Equipment Price Lists');
    await expect(panel.locator('.equipment-list').first()).toBeVisible();

    await panel.getByLabel('Search').fill('rope');
    await expect(panel.getByRole('status')).toContainText('match');
    await expect(panel.locator('.data-table td.numeric').first()).not.toBeEmpty();
  });
});
