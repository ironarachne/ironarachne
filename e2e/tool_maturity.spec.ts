import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';

/**
 * Maturity as the user meets it.
 *
 * The catalog's own tests prove every tool declares a level; what they cannot prove is that the
 * level reaches a screen. That is the whole point of the field — a promise about durability that
 * lives only in a TypeScript type is the paragraph in a document it replaced.
 *
 * Release-ready is the exception, and the other half of what this file pins: it is an internal
 * classifier, so it must reach no screen at all (#43). The absence is asserted rather than assumed,
 * because a badge that quietly comes back is exactly the regression nothing else here would catch.
 *
 * The expected levels are written out rather than imported from `$lib/tools`, in keeping with the
 * rest of `e2e/`: a spec that read the catalog would pass whatever the catalog happened to say.
 */

const maturityBadge = (page: Page) => page.locator('.maturity__level');

const TOOL_PAGES = [
  // Was `/planet` until #61 and `/drug` until #64, both of which reached Release-ready. Any
  // Experimental tool serves here; the spooky starship is one with a stable title and no renderer
  // to wait for.
  { path: '/spooky-ship', title: 'Spooky Ship Generator | Iron Arachne', level: 'Experimental' },
] as const;

/** The release-ready tools, which must say nothing at all. */
const SILENT_TOOL_PAGES = [
  { path: '/character', title: 'Character | Iron Arachne' },
  {
    path: '/fantasy/dcc/character',
    title: 'Dungeon Crawl Classics Character Generator | Iron Arachne',
  },
  { path: '/culture', title: 'Culture Generator | Iron Arachne' },
  {
    path: '/swn/character',
    title: 'Stars Without Number Character Generator | Iron Arachne',
  },
  {
    path: '/unchartedworlds/character',
    title: 'Uncharted Worlds Character Generator | Iron Arachne',
  },
  { path: '/heraldry', title: 'Heraldry Generator | Iron Arachne' },
  { path: '/velgarth-gifts', title: 'Velgarth Gifts Generator | Iron Arachne' },
  { path: '/arms-manufacturer', title: 'Arms Manufacturer Generator | Iron Arachne' },
  { path: '/star-nation', title: 'Star Nation Generator | Iron Arachne' },
  { path: '/chop-shop', title: 'Chop Shop Generator | Iron Arachne' },
  { path: '/fantasy/dungeon', title: 'Dungeon Generator | Iron Arachne' },
  { path: '/environment', title: 'Environment Generator | Iron Arachne' },
  { path: '/planet', title: 'Planet Generator | Iron Arachne', webgl: true },
  { path: '/star-system', title: 'Star System Generator | Iron Arachne', webgl: true },
  { path: '/region', title: 'Region Generator | Iron Arachne' },
  { path: '/drug', title: 'Cyberpunk Drug Generator | Iron Arachne' },
  {
    // The only reference tool in this list, and the reason it is worth naming: most of the spec
    // does not apply to a tool that produces no artifacts, so it is the one entry here whose
    // silence was earned by sections 1, 2.1, 2.5, 6, 7.1 and 8 alone (#65).
    path: '/fantasy/equipment',
    title: 'Fantasy Equipment Price Lists | Iron Arachne',
  },
  { path: '/fantasy/encounter', title: 'Encounter | Iron Arachne' },
  { path: '/fantasy/family', title: 'Fantasy Family Generator | Iron Arachne' },
  { path: '/fantasy/organization', title: 'Organization Generator | Iron Arachne' },
  { path: '/fantasy/settlement', title: 'Settlement Generator | Iron Arachne' },
  { path: '/fantasy/religion', title: 'Religion Generator | Iron Arachne' },
  { path: '/fantasy/adnd/character', title: 'AD&D 2e Character Generator | Iron Arachne' },
  {
    // Its own header rather than `GeneratorPage`, so it decides for itself whether to show a
    // badge. Worth keeping in the list for exactly that reason: the rule is the same but the code
    // making the call is not.
    path: '/fantasy/adnd/character/build',
    title: 'AD&D 2e Character Builder | Iron Arachne',
  },
] as const;

for (const { path, title, level } of TOOL_PAGES) {
  test(`maturity: ${path} shows ${level}`, async ({ page }) => {
    await visitRoute(page, path, { title });

    await expect(maturityBadge(page).first()).toHaveText(level);
  });
}

for (const entry of SILENT_TOOL_PAGES) {
  const { path, title } = entry;
  test(`maturity: ${path} shows no badge`, async ({ page }) => {
    await visitRoute(page, path, { title, webgl: 'webgl' in entry && entry.webgl === true });

    await expect(maturityBadge(page)).toHaveCount(0);
    // The paragraph that wrapped it goes too, not just its contents: an empty `<p>` keeps its
    // margin and pushes the tool down the page for no reason a reader could see.
    await expect(page.locator('.generator-page__maturity')).toHaveCount(0);
  });
}

test('maturity: a tool page says what its level promises', async ({ page }) => {
  await visitRoute(page, '/spooky-ship', { title: 'Spooky Ship Generator | Iron Arachne' });

  // The sentence, not just the pill: "Experimental" means nothing to a visitor who has not read
  // the design document, and the point is that they can decide before they invest work.
  await expect(page.locator('.maturity__detail').first()).toContainText('may change or disappear');
});

test('maturity: the home page does not advertise release-ready either', async ({ page }) => {
  await visitRoute(page, '/');

  // Culture is featured *and* release-ready, which is the one place outside the workshop the level
  // used to reach. Both featured tools are release-ready since #61 took planet there, so the list
  // shows no level at all — which is the rule holding rather than the check going quiet: a badge
  // appearing here would be a regression whichever level it named.
  const featured = page.locator('.home__featured');
  await expect(featured.getByRole('link', { name: 'Culture' })).toBeVisible();
  await expect(featured.getByRole('link', { name: 'Planet' })).toBeVisible();
  await expect(featured).not.toContainText('Release-ready');
  await expect(featured.locator('.maturity__level')).toHaveCount(0);
});

test('maturity: the tool browser marks every tool that has something to warn about', async ({
  page,
}) => {
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });

  const browser = page.locator('section.tool-browser');
  const tools = browser.locator('.tool-browser__tool');
  await expect(tools.first()).toBeVisible();

  // Exactly the release-ready tools are unmarked, and every one of them is mountable so every one
  // is listed here. Counted rather than spot-checked: a tool that quietly lost its badge would
  // otherwise pass every assertion below it.
  const unmarked = tools.filter({ hasNot: page.locator('.maturity__level') });
  await expect(unmarked).toHaveCount(SILENT_TOOL_PAGES.length);

  await expect(browser.getByRole('button', { name: /^Culture/ })).not.toContainText(
    'Release-ready',
  );
  await expect(browser.getByRole('button', { name: /^Settlement/ })).not.toContainText(
    'Release-ready',
  );
  await expect(
    browser.getByRole('button', { name: /^AD&D 2E Character Builder/ }),
  ).not.toContainText('Release-ready');
  await expect(browser.getByRole('button', { name: /^Fantasy Character/ })).not.toContainText(
    'Release-ready',
  );
  await expect(
    browser.getByRole('button', { name: /^Dungeon Crawl Classics Character/ }),
  ).not.toContainText('Release-ready');
  await expect(
    browser.getByRole('button', { name: /^Stars Without Number Character/ }),
  ).not.toContainText('Release-ready');
  await expect(
    browser.getByRole('button', { name: /^Uncharted Worlds Character/ }),
  ).not.toContainText('Release-ready');
  await expect(browser.getByRole('button', { name: /^Heraldry/ })).not.toContainText('Beta');
  await expect(browser.getByRole('button', { name: /^Velgarth Gifts/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Arms Manufacturer/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Fantasy Encounter/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Fantasy Family/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Fantasy Organization/ })).not.toContainText(
    'Experimental',
  );
  // Planet was the still-marked case until #61 took it to Release-ready. The drug generator is
  // Experimental and mountable, so it holds that end of the assertion now.
  await expect(browser.getByRole('button', { name: /^Planet/ })).not.toContainText('Experimental');
  await expect(browser.getByRole('button', { name: /^Cyberpunk Drug/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Spooky Ship/ })).toContainText('Experimental');
});
