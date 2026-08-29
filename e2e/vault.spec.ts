import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * The result vault (docs/app-shell.md, step 5).
 *
 * What the unit tests cannot settle is the half that only exists in a browser: that the listing
 * spans projects, that the Inspector offers no way to edit contents, and that a phone gets two
 * views rather than a list with an inspector hanging off the bottom of it.
 */

const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const row = (page: Page, name: string) =>
  vault(page).getByRole('button', { name: new RegExp(`^${name}( |$)`) });

const toolBrowser = (page: Page) => page.locator('section.tool-browser');
const panels = (page: Page) => page.locator('section.workshop-panel');
const projectsPage = (page: Page) => page.locator('section.projects');

async function openEmpty(page: Page): Promise<void> {
  await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('ironarachne.vault');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      }),
  );
  await page.reload({ waitUntil: 'load' });
}

async function createProject(page: Page, name: string): Promise<void> {
  await page.goto('/projects/');
  await projectsPage(page).getByLabel('New project').fill(name);
  await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
  await expect(projectsPage(page).locator('.project-card', { hasText: name })).toBeVisible();
}

/** Mounts the culture generator on the bench and keeps what it made, under a name of its own. */
async function saveACulture(page: Page, name: string): Promise<void> {
  await page.goto('/workshop/');
  await toolBrowser(page)
    .getByRole('button', { name: /^Culture/ })
    .click();
  const saveArtifact = panels(page)
    .filter({ has: page.getByRole('heading', { name: /Culture Generator/ }) })
    .locator('.save-artifact');
  await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
  await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
  await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
  // Anchored the way the workshop spec anchors it: a row's own button and its per-row actions all
  // carry the artifact's name, so a bare name matches three things.
  await expect(
    page.locator('section.project-view').getByRole('button', { name: new RegExp(`^${name}( |$)`) }),
  ).toBeVisible();
}

test.describe('the result vault', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
  });

  test('says what it is for when nothing is saved', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Result Vault' })).toBeVisible();
    await expect(vault(page).getByText('Nothing saved yet.')).toBeVisible();
  });

  test('lists artifacts from every project, not just the open one', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await createProject(page, 'Dolmenwood');
    await saveACulture(page, 'The Drune');

    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    // The whole point of the vault being global: Dolmenwood is the project that is open, and
    // Ashfall's culture is listed anyway.
    await expect(row(page, 'The Emberfolk')).toBeVisible();
    await expect(row(page, 'The Drune')).toBeVisible();
    // Each row says which project it came from, which is what makes a global listing legible.
    // The row label rather than the filter's option, which carries the same words.
    await expect(vault(page).locator('.vault__row-project', { hasText: 'Ashfall' })).toBeVisible();
  });

  test('narrows by project, and by search', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await createProject(page, 'Dolmenwood');
    await saveACulture(page, 'The Drune');

    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    await vault(page).getByLabel('Project').selectOption({ label: 'Ashfall' });
    await expect(row(page, 'The Emberfolk')).toBeVisible();
    await expect(row(page, 'The Drune')).toHaveCount(0);

    await vault(page).getByLabel('Project').selectOption({ label: 'All projects' });
    await vault(page).getByLabel('Search').fill('drune');
    await expect(row(page, 'The Drune')).toBeVisible();
    await expect(row(page, 'The Emberfolk')).toHaveCount(0);

    await vault(page).getByLabel('Search').fill('nothing matches this');
    await expect(vault(page).getByText('Nothing matches that.')).toBeVisible();
  });

  test('inspects a selection without offering a way to edit its contents', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    await row(page, 'The Emberfolk').click();

    await expect(inspector(page).getByRole('heading', { name: 'The Emberfolk' })).toBeVisible();
    await expect(inspector(page).getByText('Ashfall')).toBeVisible();

    // Read-only is the decision that makes a global vault safe (decision 2). Name and tags are
    // properties of the artifact as an object and stay editable; nothing else does.
    await expect(inspector(page).getByRole('button', { name: 'Save changes' })).toHaveCount(0);
    await expect(inspector(page).getByRole('button', { name: /Roll again/ })).toHaveCount(0);
    await expect(inspector(page).getByLabel('Name')).toBeVisible();
  });

  test('renames from the Inspector, and the listing follows', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    await row(page, 'The Emberfolk').click();
    await inspector(page).getByLabel('Name').fill('The Ashborn');
    await inspector(page).getByRole('button', { name: 'Save details' }).click();

    await expect(row(page, 'The Ashborn')).toBeVisible();

    // In the database rather than merely on screen.
    await page.reload({ waitUntil: 'load' });
    await expect(row(page, 'The Ashborn')).toBeVisible();
  });

  test('hands an artifact to the workshop, switching project on the way', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await createProject(page, 'Dolmenwood');

    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
    await row(page, 'The Emberfolk').click();
    await inspector(page).getByRole('button', { name: 'Open in workshop' }).click();

    // Dolmenwood was the open project; opening an artifact that lives elsewhere has to take the
    // user to the project that owns it, or the bench would be pointing at the wrong world.
    await expect(page).toHaveURL(/\/workshop\/?$/);
    await expect(
      page.locator('section.project-context').getByRole('option', { selected: true }),
    ).toHaveText('Ashfall');
  });

  test('deletes an artifact after asking', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    await row(page, 'The Emberfolk').click();
    await inspector(page).getByRole('button', { name: 'Delete' }).click();

    const dialog = page.locator('dialog.panel');
    await expect(dialog).toContainText('no copy anywhere else');
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(row(page, 'The Emberfolk')).toHaveCount(0);
    await expect(vault(page).getByText('Nothing saved yet.')).toBeVisible();
  });

  test('is two views on a phone rather than a list with an inspector under it', async ({
    page,
  }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');

    await page.setViewportSize({ width: 375, height: 700 });
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });

    await expect(vault(page).getByLabel('Search')).toBeVisible();
    await expect(inspector(page)).toBeHidden();

    await row(page, 'The Emberfolk').click();
    // The list gives way rather than scrolling past: selecting swaps the screen.
    await expect(inspector(page)).toBeVisible();
    await expect(vault(page).getByLabel('Search')).toBeHidden();

    await page.getByRole('button', { name: /All results/ }).click();
    await expect(vault(page).getByLabel('Search')).toBeVisible();
    await expect(inspector(page)).toBeHidden();
  });
});
