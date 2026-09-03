import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * The word generator cheat sheet, as a developer meets it (#76).
 *
 * The last reference tool of the pass, and the one that forced the spec question decision 8
 * answers: it has a library now, `$lib/word_patterns`, where the element table used to be an HTML
 * string the component concatenated and injected with `{@html}`. What the unit tests cannot settle
 * is that the sheet reaches the page as markup — headers, cells, and a scroll container of its own
 * — and that the same component works on its own route and in a panel (2.1).
 *
 * 6.1 is covered by `e2e/pages.mobile.spec.ts` at every width in `MOBILE_VIEWPORTS`.
 */

const TITLE = 'Word Generator Cheat Sheet | Iron Arachne';

const elementTable = (page: Page) => page.locator('.elements .data-table');
const syntaxTable = (page: Page) => page.locator('.syntax .data-table');
const words = (page: Page) => page.getByRole('list', { name: 'Generated words' }).locator('li');

async function openSheet(page: Page): Promise<void> {
  await visitRoute(page, '/word-generator-cheat-sheet', { title: TITLE });
  await expect(elementTable(page)).toBeVisible();
}

test.describe('the word generator cheat sheet', () => {
  test('renders both tables as real markup, headed', async ({ page }) => {
    await openSheet(page);

    await expect(syntaxTable(page).locator('thead th')).toHaveText([
      'Syntax',
      'Meaning',
      'Example',
    ]);
    await expect(elementTable(page).locator('thead th')).toHaveText(['Name', 'Symbol', 'Elements']);
    await expect(elementTable(page).locator('thead th').first()).toHaveAttribute('scope', 'col');

    // Every element the package ships, rather than the thirty-six its own doc comment lists.
    await expect(elementTable(page).locator('tbody tr')).toHaveCount(45);
    await expect(
      elementTable(page).locator('tbody tr', { hasText: 'consonants' }).first(),
    ).toBeVisible();
  });

  test('scrolls the element table rather than the page', async ({ page }) => {
    // 6.1, and the mechanism the design says was already right: unbreakable terms like
    // "palatals/post-alveolars" set a minimum width no phone can meet, so the table gets its own
    // scroller and carries the `data-scroll-x` that excuses it from the overflow sweep.
    await page.setViewportSize({ width: 320, height: 800 });
    await openSheet(page);

    await expect(elementTable(page)).toHaveAttribute('data-scroll-x', '');

    const overflow = await page.evaluate(() => {
      const region = document.querySelector('main.shell__page');
      return region === null ? 0 : region.scrollWidth - region.clientWidth;
    });
    expect(overflow, 'the page scrolls sideways').toBeLessThanOrEqual(0);
  });

  test('opens on a pattern that works, and never lists a blank word', async ({ page }) => {
    // Requirement 6.4. The page opened with an empty pattern, and generating from one produces
    // empty strings — ten blank bullets.
    await openSheet(page);
    await expect(page.getByRole('textbox', { name: 'Pattern' })).toHaveValue('cvcv');

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(words(page)).toHaveCount(10);
    for (const word of await words(page).allInnerTexts()) {
      expect(word.trim()).not.toBe('');
    }

    // And a pattern cleared by hand cannot produce them either.
    await page.getByRole('textbox', { name: 'Pattern' }).fill('');
    await expect(page.getByRole('button', { name: 'Generate', exact: true })).toBeDisabled();
  });

  test('reproduces the same words from the same seed', async ({ page }) => {
    // The generator built a `WordGenerator` with no RNG, so nothing it produced could be got back.
    // 2.2 and 2.3 do not bind on a reference tool; a button that generates something a developer
    // may want to quote does.
    await openSheet(page);
    const generate = page.getByRole('button', { name: 'Generate', exact: true });

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await generate.click();
    const first = await words(page).allInnerTexts();
    expect(first.length).toBe(10);

    await generate.click();
    expect(await words(page).allInnerTexts()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await generate.click();
    expect(await words(page).allInnerTexts()).not.toEqual(first);
  });

  test('downloads the sheet a developer can keep', async ({ page }) => {
    // Requirement 6.3, and the first export this page has ever had.
    await openSheet(page);
    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(words(page)).toHaveCount(10);

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toBe('word-generator-cheat-sheet.md');

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain('# Word Generator Cheat Sheet');
    expect(contents).toContain('## Pattern syntax');
    expect(contents).toContain('## Elements');
    expect(contents).toContain('Pattern `cvcv`, seed `a-fixed-seed`');
    // The clicks set is made of the character a Markdown table separates columns with.
    expect(contents).toContain('\\|');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toBe('word-generator-cheat-sheet.pdf');
  });

  test('is operable by keyboard, with named controls', async ({ page }) => {
    // Requirement 6.2.
    await openSheet(page);

    await page.getByRole('textbox', { name: 'Pattern' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Number of Words')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Seed', { exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Lock Seed')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Generate', exact: true })).toBeFocused();

    // The two tables look alike enough that they need names that do not.
    await expect(syntaxTable(page).locator('table')).toHaveAttribute(
      'aria-label',
      'Pattern syntax',
    );
    await expect(elementTable(page).locator('table')).toHaveAttribute(
      'aria-label',
      'Word pattern elements',
    );
  });

  test('works the same mounted in a workshop panel', async ({ page }) => {
    // Requirement 2.1.
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Word Generator Cheat Sheet/ })
      .click();

    const panel = page.locator('section.workshop-panel');
    await expect(panel.locator('.panel__title')).toContainText('Word Generator Cheat Sheet');
    await expect(panel.locator('.elements .data-table tbody tr')).toHaveCount(45);

    await panel.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(panel.getByRole('list', { name: 'Generated words' }).locator('li')).toHaveCount(
      10,
    );
  });
});
