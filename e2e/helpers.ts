import { expect, type Page } from '@playwright/test';

/**
 * The six shell destinations, in sidebar order. Mirrors `NAV_DESTINATIONS` in `$lib/navigation`
 * deliberately rather than importing it: this is the browser's view of the navigation, and a test
 * that read the same constant the component reads could not tell a rendering failure from an
 * empty list.
 */
const SIDEBAR_LINKS = [
  'Home',
  'Workshop',
  'All Tools',
  'Projects',
  'Result Vault',
  'Release Notes',
] as const;

export async function visitRoute(
  page: Page,
  path: string,
  options?: { title?: string; webgl?: boolean },
): Promise<void> {
  await page.goto(path, { waitUntil: 'load' });
  if (options?.title) {
    await expect(page).toHaveTitle(options.title, { timeout: options.webgl ? 30_000 : 15_000 });
  }
}

/**
 * The shell every route renders inside: the lockup in the top bar, the six sidebar destinations,
 * and the footer links.
 *
 * The sidebar is only asserted at widths where it is in the layout. Below 768px it is an
 * off-canvas drawer, and a link inside a closed drawer is legitimately not visible — asserting it
 * there would be asserting the drawer is broken.
 */
export async function expectGlobalChrome(page: Page): Promise<void> {
  await expect(page.getByRole('link', { name: 'Iron Arachne' }).first()).toBeVisible();

  const width = page.viewportSize()?.width ?? 1280;
  if (width >= 768) {
    const sidebar = page.getByRole('navigation', { name: 'Main' });
    for (const label of SIDEBAR_LINKS) {
      await expect(sidebar.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  }

  await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mastodon' })).toBeVisible();
}

export async function expectPageContent(
  page: Page,
  entry: {
    heading?: string;
    kind: string;
  },
): Promise<void> {
  if (entry.heading) {
    await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
  }
}

/**
 * Matches only a button labelled exactly "Generate", so pages that also offer a
 * narrower control (e.g. "Generate name") stay unambiguous. Pages whose main
 * button is named something else declare `generateButton` in the manifest.
 */
const DEFAULT_GENERATE_BUTTON = /^Generate$/i;

export async function clickGenerateButton(
  page: Page,
  generateButton: RegExp = DEFAULT_GENERATE_BUTTON,
  timeout = 15_000,
  noWaitAfter = false,
): Promise<void> {
  const button = page.getByRole('button', { name: generateButton });
  await expect(button).toBeVisible({ timeout });
  await button.click({ timeout, noWaitAfter });
}

export async function expectGeneratorOutput(
  page: Page,
  outputCheck: 'canvas' | 'svg' | 'stats' | 'preview-image' | 'default' = 'default',
): Promise<void> {
  switch (outputCheck) {
    case 'canvas':
      await expect(page.locator('canvas').first()).toBeVisible();
      return;
    case 'svg':
      await expect(page.locator('svg').first()).toBeVisible();
      return;
    case 'stats':
      await expect(page.getByRole('heading', { name: 'Calculated Stats' })).toBeVisible();
      // The size ladder is a `DataTable` per gender since #75, where it was a stack of `StatBlock`s
      // under an `<h5>` that followed an `<h3>` — a heading level skipped, and a table of four
      // columns rendered as anything but a table.
      //
      // The cells rather than the column heads: this helper runs at every mobile width too, and
      // below 640px a flipping `DataTable` hides its `<thead>` and each cell wears its key from
      // `data-label` instead. `species_stats.spec.ts` checks the heads at desktop width, where
      // they exist. The key is asserted here because a cell that lost it would lose it silently
      // on exactly these screens.
      // Located by `data-label` rather than by role and name: below 640px the flip paints the key
      // as `::before` content, which Chromium folds into the cell's accessible name, so the adult
      // row is named "Age categoryadult" there and "adult" here.
      await expect(page.locator('td[data-label="Age range"]').first()).toBeVisible();
      await expect(
        page
          .locator('td[data-label="Age category"]')
          .filter({ hasText: /^adult$/ })
          .first(),
      ).toBeVisible();
      return;
    case 'preview-image':
      await expect(page.locator('img[alt*="image"], img[alt*="composite"]').first()).toBeVisible({
        timeout: 30_000,
      });
      return;
    default: {
      const main = page.locator('section.main, section.navigation, section.home').first();
      await expect(main).toBeVisible();
      await expect(main).not.toHaveText(/^[\s]*$/);
      return;
    }
  }
}
