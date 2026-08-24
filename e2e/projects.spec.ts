import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';
import { editingCard, projectCard, projectsPage } from './projects';

/**
 * The projects page (docs/app-shell.md, step 4).
 *
 * Creating, renaming, describing and deleting a project used to happen on the bench, and the
 * workshop spec covered them there. They moved here, and so did their coverage: the workshop's
 * remaining project tests are about the switcher following what this page does.
 */

/** A projects page with nothing in it: each test starts from an origin no other run has touched. */
async function openEmptyProjects(page: Page): Promise<void> {
  await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });
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

async function create(page: Page, name: string): Promise<void> {
  await projectsPage(page).getByLabel('New project').fill(name);
  await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
  await expect(projectCard(page, name)).toBeVisible();
}

test.describe('the projects page', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyProjects(page);
  });

  test('says what it is for when there is nothing in it', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
    await expect(projectsPage(page).getByText('No projects yet.')).toBeVisible();
  });

  test('creates a project, opens it, and keeps it across a reload', async ({ page }) => {
    await create(page, 'Ashfall');

    // Creating a project is an explicit request to work in it, so it is the one that is open.
    await expect(projectCard(page, 'Ashfall').getByText('Open')).toBeVisible();

    await page.reload({ waitUntil: 'load' });
    await expect(projectCard(page, 'Ashfall')).toBeVisible();
  });

  test('renames and describes a project in one write', async ({ page }) => {
    await create(page, 'Ashfall');

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Name').fill('Ashfall Reborn');
    await editingCard(page).getByLabel('Description').fill('A dying sun campaign');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();

    const card = projectCard(page, 'Ashfall Reborn');
    await expect(card).toBeVisible();
    await expect(card.getByText('A dying sun campaign')).toBeVisible();

    // In the database rather than merely on screen.
    await page.reload({ waitUntil: 'load' });
    await expect(
      projectCard(page, 'Ashfall Reborn').getByText('A dying sun campaign'),
    ).toBeVisible();
  });

  test('abandons an edit that is cancelled', async ({ page }) => {
    await create(page, 'Ashfall');

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Name').fill('Something else');
    await editingCard(page).getByRole('button', { name: 'Cancel' }).click();

    await expect(projectCard(page, 'Ashfall')).toBeVisible();
    await expect(projectsPage(page).locator('.project-card')).toHaveCount(1);
  });

  test('asks before deleting, and says how much goes with it', async ({ page }) => {
    await create(page, 'Ashfall');

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Delete' }).click();

    // There is no server copy to restore from, so the question has to carry the consequence.
    const dialog = page.locator('dialog.ironarachne-modal');
    await expect(dialog).toContainText('cannot be undone');

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(projectCard(page, 'Ashfall')).toBeVisible();

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Delete' }).click();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(projectCard(page, 'Ashfall')).toHaveCount(0);

    await page.reload({ waitUntil: 'load' });
    await expect(projectsPage(page).getByText('No projects yet.')).toBeVisible();
  });

  test('reports what each project holds', async ({ page }) => {
    await create(page, 'Ashfall');

    // An empty project reports zero rather than leaving the line blank — a blank reads as a
    // failure to load rather than as an empty project.
    await expect(projectCard(page, 'Ashfall')).toContainText('0 artifacts');

    // The size is not here any more. The cards are ordered by recency and the storage panel's
    // table by size, and the same number in two orders on one page is a number a reader has to
    // reconcile — so it lives in the table, which is what e2e/storage_panel.spec.ts covers.
    // See docs/storage-panel.md, decision 3.
    await expect(projectCard(page, 'Ashfall')).not.toContainText('0 B');
  });

  test('offers both backup granularities with no project open', async ({ page }) => {
    // The whole point of backup living here: a user restoring into a fresh browser has no project,
    // and a control that needed one would be missing in exactly the case it exists for.
    await expect(projectsPage(page).getByText('No projects yet.')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Export everything' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import from file…' })).toBeVisible();
  });
});

/**
 * The local-only disclosure (docs/storage-disclosure.md, #26).
 *
 * **Nothing here asserts what the browser decided about persistence.** `navigator.storage.persist()`
 * is requested in the same moment, and headless Chromium's answer is not ours to pin: a suite that
 * depended on it would fail on a browser upgrade for a reason that has nothing to do with the
 * feature. What is testable is what the user is told, and how often.
 */
test.describe('being told the work lives in this browser', () => {
  const disclosure = (page: Page) => projectsPage(page).locator('.storage-disclosure');

  test.beforeEach(async ({ page }) => {
    await openEmptyProjects(page);
  });

  test('is not said before there is anything to lose', async ({ page }) => {
    // Not on first load, deliberately: the sentence pairs with a permission request, and a request
    // made before the user has built anything is one they dismiss.
    await expect(disclosure(page)).toHaveCount(0);
  });

  test('is said once at the first project, and not again', async ({ page }) => {
    await create(page, 'Ashfall');

    await expect(disclosure(page)).toContainText('saved in this browser only');
    await expect(disclosure(page)).toContainText('no account and no server');

    await disclosure(page).getByRole('button', { name: 'Got it' }).click();
    await expect(disclosure(page)).toHaveCount(0);

    await create(page, 'Tallow');
    await expect(disclosure(page)).toHaveCount(0);
  });

  test('stays said across a reload, because the stamp is in the vault', async ({ page }) => {
    await create(page, 'Ashfall');
    await expect(disclosure(page)).toBeVisible();

    await page.reload({ waitUntil: 'load' });
    await create(page, 'Tallow');

    await expect(disclosure(page)).toHaveCount(0);
  });

  test('points at the backup controls, since export is what it asks for', async ({ page }) => {
    await create(page, 'Ashfall');

    await disclosure(page).getByRole('link', { name: 'Back up your work' }).click();

    // The promise the sentence makes — export is how your work leaves — has to land somewhere the
    // reader can act on without hunting for it.
    await expect(page.getByRole('button', { name: 'Export everything' })).toBeInViewport();
  });
});
