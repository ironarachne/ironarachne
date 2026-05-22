import { expect, type Page } from '@playwright/test';

const TOP_NAV_LINKS = [
  'Home',
  'Characters',
  'Factions',
  'Locations',
  'Objects',
  'Utilities',
  'Change Log',
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

export async function expectGlobalChrome(page: Page): Promise<void> {
  await expect(page.getByRole('img', { name: 'Iron Arachne logo glyph' })).toBeVisible();

  const topNav = page.getByRole('navigation').first();
  for (const label of TOP_NAV_LINKS) {
    await expect(topNav.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await expect(page.getByRole('link', { name: 'Codeberg' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mastodon' })).toBeVisible();
}

export async function expectPageContent(page: Page, entry: {
  heading?: string;
  welcomeText?: string;
  kind: string;
}): Promise<void> {
  if (entry.welcomeText) {
    await expect(page.getByText(entry.welcomeText)).toBeVisible();
    return;
  }

  if (entry.heading) {
    await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
  }

  if (entry.kind === 'hub') {
    const hubNav = page.locator('section.navigation nav, section.main nav').first();
    await expect(hubNav.locator('a[href]').first()).toBeVisible();
  }
}

export async function clickGenerateButton(
  page: Page,
  generateButton: RegExp = /^Generate/i,
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
      await expect(page.getByText('Age Range:').first()).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'adult', level: 5, exact: true }).first(),
      ).toBeVisible();
      return;
    case 'preview-image':
      await expect(
        page.locator('img[alt*="image"], img[alt*="composite"]').first(),
      ).toBeVisible({ timeout: 30_000 });
      return;
    default: {
      const main = page.locator('section.main, section.fantasy, section.navigation, section.home').first();
      await expect(main).toBeVisible();
      await expect(main).not.toHaveText(/^[\s]*$/);
      return;
    }
  }
}
