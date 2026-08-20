import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const drawerToggle = (page: Page) => page.getByRole('button', { name: /navigation/i });

const DESKTOP = { width: 1400, height: 900 };
const RAIL = { width: 1000, height: 800 };
const DRAWER = { width: 375, height: 700 };

test.describe('the application shell', () => {
  test('puts the same five destinations on every route', async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    for (const route of ['/', '/workshop', '/vault', '/projects', '/release-notes']) {
      await visitRoute(page, route);
      await expect(sidebar(page).getByRole('link')).toHaveText([
        'Home',
        'Workshop',
        'Projects',
        'Result Vault',
        'Release Notes',
      ]);
    }
  });

  test('marks the destination you are on, and marks none on a tool route', async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await expect(sidebar(page).getByRole('link', { name: 'Workshop' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Decision 1 in docs/app-shell.md: a tool route keeps its URL but is not a destination, so
    // nothing in the sidebar should claim to be the page you are on.
    await visitRoute(page, '/culture');
    await expect(sidebar(page).locator('[aria-current="page"]')).toHaveCount(0);
  });

  test('shows the status the bar promises, and keeps the tool count honest', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await visitRoute(page, '/');

    const bar = page.locator('.top-bar');
    await expect(bar.getByText('Tools')).toBeVisible();
    await expect(bar.getByText('Artifacts')).toBeVisible();
    await expect(bar.getByText('Project')).toBeVisible();

    // The count is the catalog's length, so it is a number greater than zero rather than a
    // placeholder that never resolved.
    const tools = bar.locator('.top-bar__stat--tools dd');
    await expect(tools).not.toHaveText('—');
    expect(Number(await tools.innerText())).toBeGreaterThan(0);
  });

  test('keeps the sidebar in the layout down to the rail width', async ({ page }) => {
    await page.setViewportSize(RAIL);
    await visitRoute(page, '/');

    await expect(sidebar(page)).toBeVisible();
    await expect(drawerToggle(page)).toBeHidden();
  });

  test('collapses to a drawer on a phone, and closes it on Escape', async ({ page }) => {
    await page.setViewportSize(DRAWER);
    await visitRoute(page, '/');

    const toggle = drawerToggle(page);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar(page).getByRole('link', { name: 'Workshop' })).toBeVisible();

    // `inert` on the page below is what holds focus inside the drawer; without it the drawer is
    // a panel you can tab straight out of and behind.
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  });

  test('closes the drawer behind a link it followed', async ({ page }) => {
    await page.setViewportSize(DRAWER);
    await visitRoute(page, '/');

    await drawerToggle(page).click();
    await sidebar(page).getByRole('link', { name: 'Release Notes' }).click();

    await expect(page).toHaveTitle('Release Notes | Iron Arachne');
    await expect(drawerToggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('spends the whole width on the workshop and keeps the measure on prose', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);

    // The point of the redesign: the bench gets the page region, and a page of running text does
    // not, because a 1200px line is unreadable.
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    const bench = await page.locator('section.workshop').boundingBox();
    expect(bench?.width ?? 0).toBeGreaterThan(900);

    await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });
    const prose = await page.locator('section.main').boundingBox();
    expect(prose?.width ?? 0).toBeLessThan(900);
  });
});
