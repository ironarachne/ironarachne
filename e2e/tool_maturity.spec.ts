import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';

/**
 * Maturity as the user meets it.
 *
 * The catalog's own tests prove every tool declares a level; what they cannot prove is that the
 * level reaches a screen. That is the whole point of the field — a promise about durability that
 * lives only in a TypeScript type is the paragraph in a document it replaced.
 *
 * The expected levels are written out rather than imported from `$lib/tools`, in keeping with the
 * rest of `e2e/`: a spec that read the catalog would pass whatever the catalog happened to say.
 */

const maturityBadge = (page: Page) => page.locator('.maturity__level');

const TOOL_PAGES = [
  { path: '/planet', title: 'Planet Generator | Iron Arachne', level: 'Experimental' },
  { path: '/heraldry', title: 'Heraldry Generator | Iron Arachne', level: 'Beta' },
  { path: '/culture', title: 'Culture Generator | Iron Arachne', level: 'Release-ready' },
  {
    path: '/fantasy/settlement',
    title: 'Settlement Generator | Iron Arachne',
    level: 'Release-ready',
  },
  {
    // Its own header rather than `GeneratorPage`, so it states its maturity itself and is worth
    // checking separately.
    path: '/fantasy/adnd/character/build',
    title: 'AD&D 2e Character Builder | Iron Arachne',
    level: 'Experimental',
  },
  { path: '/workshop', title: 'Workshop | Iron Arachne', level: 'Experimental' },
] as const;

for (const { path, title, level } of TOOL_PAGES) {
  test(`maturity: ${path} shows ${level}`, async ({ page }) => {
    await visitRoute(page, path, { title, webgl: path === '/planet' });

    await expect(maturityBadge(page).first()).toHaveText(level);
  });
}

test('maturity: a tool page says what its level promises', async ({ page }) => {
  await visitRoute(page, '/planet', { title: 'Planet Generator | Iron Arachne', webgl: true });

  // The sentence, not just the pill: "Experimental" means nothing to a visitor who has not read
  // the design document, and the point is that they can decide before they invest work.
  await expect(page.locator('.maturity__detail').first()).toContainText('may change or disappear');
});

test('maturity: the tool browser marks every tool it lists', async ({ page }) => {
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });

  const browser = page.locator('section.tool-browser');
  const tools = browser.locator('.tool-browser__tool');
  await expect(tools.first()).toBeVisible();

  const toolCount = await tools.count();
  await expect(browser.locator('.maturity__level')).toHaveCount(toolCount);

  await expect(browser.getByRole('button', { name: /^Culture/ })).toContainText('Release-ready');
  await expect(browser.getByRole('button', { name: /^Settlement/ })).toContainText('Release-ready');
  await expect(browser.getByRole('button', { name: /^Heraldry/ })).toContainText('Beta');
  await expect(browser.getByRole('button', { name: /^Planet/ })).toContainText('Experimental');
});
