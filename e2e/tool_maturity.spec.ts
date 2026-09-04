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
 *
 * **Since #74 there is no Experimental tool left, and this file changed shape because of it.** It
 * had a list of one — rewritten four times as planet, drug, spooky ship and finally the language
 * generator each reached Release-ready — whose job was to prove a level reaches a screen. The
 * catalog is now release-ready end to end, so no page can show a badge, and a list of one has
 * nowhere left to point.
 *
 * What replaces it is the assertion that the site is silent everywhere, plus the note below on what
 * to restore. The badge's own logic — which levels show, what each promises — is unit-tested in
 * `src/lib/tools/tools.test.ts` and is not what was lost here; what is no longer covered is the
 * wiring from that logic to `ToolMaturityBadge` on a real page. **The day a tool is added at
 * Experimental or Beta, put it back in `TOOL_PAGES` below and restore the two tests that read it.**
 * That is cheaper than keeping a fixture route alive to exercise a badge nothing currently shows.
 */

const maturityBadge = (page: Page) => page.locator('.maturity__level');

/**
 * The tools that must show a level, and there are none.
 *
 * Was `/planet` until #61, `/drug` until #64, `/spooky-ship` until #71 and `/language` until #74 —
 * each in turn the last Experimental tool on the site, and each promoted out of the role. Kept as
 * an empty list rather than deleted so that adding one entry is all it takes to get the assertion
 * back; see the note at the top of this file.
 */
const TOOL_PAGES: { path: string; title: string; level: string }[] = [];

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
  { path: '/fantasy/equipment-generator', title: 'Equipment Generator | Iron Arachne' },
  { path: '/fantasy/merchant', title: 'Fantasy Merchant Generator | Iron Arachne' },
  { path: '/fantasy/potion-generator', title: 'Potion Generator | Iron Arachne' },
  { path: '/fantasy/weapon', title: 'Magic Weapon Generator | Iron Arachne' },
  { path: '/fantasy/treasure-hoard', title: 'Treasure Hoard Generator | Iron Arachne' },
  { path: '/spooky-ship', title: 'Spooky Ship Generator | Iron Arachne' },
  { path: '/language', title: 'Language Generator | Iron Arachne' },
  {
    path: '/swn/starship',
    title: 'Stars Without Number Starship Generator | Iron Arachne',
  },
  {
    // The first reference tool in this list, and the reason it is worth naming: most of the spec
    // does not apply to a tool that produces no artifacts, so its silence was earned by sections
    // 1, 2.1, 2.5, 6, 7.1 and 8 alone (#65).
    path: '/fantasy/equipment',
    title: 'Fantasy Equipment Price Lists | Iron Arachne',
  },
  {
    // The second, and the only genre-neutral tool here: #75 dropped a `fantasy` tag that scaling a
    // human baseline never earned.
    path: '/species-stats',
    title: 'Species Height and Weight Calculator | Iron Arachne',
  },
  {
    // The third and last reference tool of the pass (#76), and the one that forced the question
    // decision 8 answers: a tool with no library gets one rather than an exemption.
    path: '/word-generator-cheat-sheet',
    title: 'Word Generator Cheat Sheet | Iron Arachne',
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

test('maturity: no tool page says anything, every tool being release-ready', async ({ page }) => {
  // The counterpart to `TOOL_PAGES` being empty, and the reason it is asserted rather than left
  // implied: this is a true statement about the site today, and it stops being true the moment a
  // tool ships below Release-ready. A spec that simply dropped the check would go quiet instead.
  //
  // The sentence a badge shows — "Experimental" means nothing to a visitor who has not read the
  // design document — is covered by `maturityDescription` in `src/lib/tools/tools.test.ts`.
  await visitRoute(page, '/language', { title: 'Language Generator | Iron Arachne' });

  await expect(page.locator('.maturity__detail')).toHaveCount(0);
  await expect(maturityBadge(page)).toHaveCount(0);
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

  // Every tool in the browser is unmarked, the catalog being release-ready end to end since #74.
  // Counted against the rendered total rather than against `SILENT_TOOL_PAGES`, which is the subset
  // with a route this file also visits: the claim here is that *nothing* is marked, and comparing
  // two numbers that must now both equal the whole would say less than it appears to.
  const unmarked = tools.filter({ hasNot: page.locator('.maturity__level') });
  await expect(unmarked).toHaveCount(await tools.count());
  await expect(browser.locator('.maturity__level')).toHaveCount(0);

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
  // Planet was the still-marked case until #61 took it to Release-ready, then the drug until #64
  // and the spooky starship until #71. The language generator holds that end of the assertion now,
  // and it is in another domain, so this stops being rewritten every time the objects pass finishes
  // a tool.
  await expect(browser.getByRole('button', { name: /^Planet/ })).not.toContainText('Experimental');
  await expect(browser.getByRole('button', { name: /^Cyberpunk Drug/ })).not.toContainText(
    'Experimental',
  );
  await expect(browser.getByRole('button', { name: /^Spooky Ship/ })).not.toContainText(
    'Experimental',
  );
  // Was the still-marked case until #74 took it to Release-ready — as planet, the drug and the
  // spooky starship were before it. There is no still-marked case now, which is what the count
  // above asserts.
  await expect(browser.getByRole('button', { name: /^Language/ })).not.toContainText(
    'Experimental',
  );
});
