import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

const DESKTOP = { width: 1400, height: 900 };

const index = (page: Page) => page.locator('section.all-tools');
const toolLinks = (page: Page) => index(page).locator('a.all-tools__tool');

test.describe('the tool index', () => {
  test('links every tool in the catalog', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    // Counted against the top bar's own figure rather than against a number written here, and
    // rather than against `TOOL_CATALOG` imported from `src`: the suites mirror the app instead of
    // reading its constants, so a test cannot pass by agreeing with a catalog that failed to
    // render. The bar reads the catalog's length on every page, so "the index lists as many tools
    // as the shell says exist" is the whole claim — a tool added without an anchor fails here.
    // Waited for rather than sampled. The bar renders `—` until its hydration resolves, and
    // `Number('—')` is `NaN` — so reading the text once is a race that a slow machine loses. It
    // lost it on CI three merges running while passing locally every time, which is exactly the
    // shape of bug a snapshot read produces.
    const toolCount = page.locator('.top-bar .top-bar__stat--tools dd').first();
    await expect(toolCount).toHaveText(/^\d+$/);

    const declared = Number(await toolCount.innerText());

    expect(declared).toBeGreaterThan(0);
    await expect(toolLinks(page)).toHaveCount(declared);
  });

  test('goes to the tool on its own route rather than opening a panel', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    // The reason the page exists: these are anchors, so following one navigates. A button that
    // mounted a panel would leave the URL on /tools, which is the dead end the workshop's browser
    // already is for anyone who wanted a link.
    // Matched on the start of the accessible name, not the whole of it: the maturity badge sits
    // inside the anchor, so the name a screen reader reads is "Culture Experimental" today and
    // "Culture" on the day that tool is finished. No other label begins with the word.
    await index(page)
      .getByRole('link', { name: /^Culture\b/ })
      .click();

    await expect(page).toHaveURL(/\/culture\/?$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('narrows to a name and says how much is left', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    const all = await toolLinks(page).count();

    await index(page).getByLabel('Filter').fill('heraldry');

    await expect(toolLinks(page)).toHaveCount(1);
    await expect(index(page).getByRole('status')).toHaveText(`1 of ${all} tools`);

    await index(page).getByLabel('Filter').fill('nothing matches this');

    await expect(toolLinks(page)).toHaveCount(0);
    await expect(index(page).getByText('No tools match.')).toBeVisible();
  });

  test('marks itself in the sidebar, as a destination and not a tool route', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await visitRoute(page, '/tools', { title: 'All Tools | Iron Arachne' });

    const sidebar = page.getByRole('navigation', { name: 'Main' });
    await expect(sidebar.getByRole('link', { name: 'All Tools', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
