import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * The species height and weight calculator, as an author meets it (#75).
 *
 * A reference tool produces no artifacts, so requirement 7.4 does not bind and there is no
 * generate/save/reopen/edit journey to cover. What is left is what the unit tests cannot settle:
 * the page renders the same sheet the exports write, the fields recompute it, the same component
 * works on its own route and in a panel (2.1), and the controls can be reached and used by name
 * (6.2).
 *
 * 6.1 is covered by `e2e/pages.mobile.spec.ts` at every width in `MOBILE_VIEWPORTS`, and the
 * ladder's own flip by `e2e/tables.spec.ts`.
 */

const TITLE = 'Species Height and Weight Calculator | Iron Arachne';

const summary = (page: Page) => page.locator('.summary');
const ladders = (page: Page) => page.locator('.ladder');

/**
 * One ladder's adult row.
 *
 * Matched on the cell rather than on the row's text: "adult" is a substring of "young adult", and
 * the young adult row comes first.
 */
const adultRow = (page: Page, ladder: ReturnType<typeof ladders>) =>
  ladder
    .locator('tbody tr')
    .filter({ has: page.getByRole('cell', { name: 'adult', exact: true }) });

async function openCalculator(page: Page): Promise<void> {
  await visitRoute(page, '/species-stats', { title: TITLE });
  await expect(ladders(page)).toHaveCount(2);
}

test.describe('the species height and weight calculator', () => {
  test('starts on the human baseline and says so', async ({ page }) => {
    await openCalculator(page);

    await expect(summary(page)).toContainText(
      'female at 100% of human height and 100% of human weight',
    );
    await expect(summary(page)).toContainText('maximum lifespan of 100 years');

    // The adult row of the female ladder is the human figure the whole tool is a proportion of.
    await expect(adultRow(page, ladders(page).first())).toContainText('160');
  });

  test('recomputes both ladders as the proportions change', async ({ page }) => {
    await openCalculator(page);

    await page.getByLabel('Female % of Base Height', { exact: true }).fill('50');
    await page.getByLabel('Male % of Base Height', { exact: true }).fill('200');
    await expect(summary(page)).toContainText('female at 50% of human height');

    await expect(adultRow(page, ladders(page).first())).toContainText('80');
    await expect(adultRow(page, ladders(page).nth(1))).toContainText('350');
  });

  test('never shows an age range that ends before it begins', async ({ page }) => {
    // Requirement 6.4. A cleared number field binds to `null`, `null / 100` is `0`, and an age
    // modifier of zero used to walk the ladder into rows reading "2 to 1 years".
    await openCalculator(page);
    await page.getByLabel('Maximum Age (Years)', { exact: true }).fill('');
    await page.getByLabel('Female % of Base Height', { exact: true }).fill('');

    const ranges = await page.locator('.data-table tbody tr td:nth-child(2)').allInnerTexts();
    expect(ranges.length).toBeGreaterThan(0);
    for (const range of ranges) {
      const [from, to] = range.replace(' years', '').split(' to ').map(Number);
      expect(Number.isFinite(from), range).toBe(true);
      expect(to, range).toBeGreaterThanOrEqual(from);
    }

    // And the sheet still reads as a sheet rather than as a row of blanks.
    await expect(summary(page)).toContainText('maximum lifespan of');
  });

  test('downloads the sheet an author can take away', async ({ page }) => {
    // Requirement 6.3, and the first export this tool has ever had.
    await openCalculator(page);
    await page.getByLabel('Maximum Age (Years)', { exact: true }).fill('350');
    await page.getByLabel('Female % of Base Weight', { exact: true }).fill('85');

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toBe('species-stats-f100x85-m100x100-age350.md');

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain('# Species Height and Weight Calculator');
    expect(contents).toContain('| Age category | Age range | Height | Weight |');
    expect(contents).toContain('## Ingenium Second Edition heritage');
    // What was downloaded is what is on screen.
    expect(contents).toContain(await summary(page).innerText());

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toBe('species-stats-f100x85-m100x100-age350.pdf');
  });

  test('is operable by keyboard, with headed columns and named fields', async ({ page }) => {
    // Requirement 6.2. The five fields used to be labelled "% of Base Height" twice over, told
    // apart only by an `<h3>` above them, and the ladder's rows sat under an `<h5>` that followed
    // an `<h3>` — a heading level skipped, in a page whose content is a table.
    await openCalculator(page);

    await page.getByLabel('Maximum Age (Years)', { exact: true }).focus();
    for (const label of [
      'Female % of Base Height',
      'Female % of Base Weight',
      'Male % of Base Height',
      'Male % of Base Weight',
    ]) {
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(label, { exact: true })).toBeFocused();
    }

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Download Markdown' })).toBeFocused();

    const headers = ladders(page).first().locator('thead th');
    await expect(headers).toHaveText(['Age category', 'Age range', 'Height', 'Weight']);
    await expect(headers.first()).toHaveAttribute('scope', 'col');

    // Two tables that look alike need names that do not.
    await expect(ladders(page).first().locator('table')).toHaveAttribute(
      'aria-label',
      'Female sizes by age',
    );
    await expect(ladders(page).nth(1).locator('table')).toHaveAttribute(
      'aria-label',
      'Male sizes by age',
    );
  });

  test('works the same mounted in a workshop panel', async ({ page }) => {
    // Requirement 2.1.
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Species Height and Weight Calculator/ })
      .click();

    const panel = page.locator('section.workshop-panel');
    await expect(panel.locator('.panel__title')).toContainText(
      'Species Height and Weight Calculator',
    );
    await expect(panel.locator('.ladder')).toHaveCount(2);

    await panel.getByLabel('Male % of Base Weight', { exact: true }).fill('250');
    await expect(panel.locator('.summary')).toContainText('250% of human weight');
  });
});
