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

/**
 * The project context bar is the proof that `$lib/projects` works against a real browser's
 * localStorage: unit tests run against a stub, and "survives a reload" is a claim only a browser
 * can settle. Each test starts from a cleared origin so one run cannot inherit another's projects.
 */
test.describe('workshop projects', () => {
  test.beforeEach(async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
  });

  const projectContext = (page: Page) => page.locator('section.project-context');

  async function createProject(page: Page, name: string): Promise<void> {
    await projectContext(page).getByLabel('New project').fill(name);
    await projectContext(page).getByRole('button', { name: 'Create project' }).click();
  }

  test('creates, renames, and deletes projects, and the set survives a reload', async ({
    page,
  }) => {
    await expect(page.getByText('No project yet. Create one to start building.')).toBeVisible();

    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');
    await expect(projectContext(page).getByText('2 projects')).toBeVisible();

    // The bar opens what it creates, so the second project is the one on show.
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Dolmenwood');

    await projectContext(page).getByLabel('Name').fill('Dolmenwood Revised');
    await projectContext(page).getByRole('button', { name: 'Rename' }).click();

    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByText('2 projects')).toBeVisible();
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Dolmenwood Revised');

    await projectContext(page).getByRole('button', { name: 'Delete project' }).click();
    await expect(projectContext(page).getByText('1 project', { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');
  });

  test('opens exactly one project at a time, and that survives a reload', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');

    // Ashfall is the older project, so if the selection had not persisted the workshop would
    // reopen Dolmenwood — the most recently updated one — instead.
    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');
    await expect(projectContext(page).getByRole('option', { selected: true })).toHaveText(
      'Ashfall',
    );
  });
});
