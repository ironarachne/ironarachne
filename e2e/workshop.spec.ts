import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';

/**
 * The workshop is a prototype: it is reachable at /workshop but deliberately not linked from
 * navigation, so it has no PAGE_MANIFEST entry and the smoke suite never visits it.
 *
 * The default-tool assertions are structural rather than named after a particular tool, so
 * reordering the catalog does not break them.
 */
test.describe('the workshop', () => {
  const toolButtons = (page: Page) => page.locator('section.tool-browser button');
  const panelHeading = (page: Page) => page.locator('section.tool-panel h1');

  test('opens with the first tool in the browser already loaded', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });

    await expect(page.getByRole('heading', { level: 1, name: 'Workshop' })).toBeVisible();
    await expect(toolButtons(page).first()).toContainText('Loaded');
    await expect(panelHeading(page)).toBeVisible();
  });

  test('swaps the panel when a different tool is picked', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await expect(panelHeading(page)).toBeVisible();

    // Matched on the label as a prefix: picking a tool appends "Loaded" to its accessible name.
    const culture = page.getByRole('button', { name: /^Culture/ });
    await culture.click();

    await expect(page.getByRole('heading', { level: 1, name: 'Culture Generator' })).toBeVisible();
    await expect(culture).toContainText('Loaded');
    await expect(toolButtons(page).first()).not.toContainText('Loaded');
  });
});
