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

    const dialog = page.locator('dialog.panel');

    // The `[open]` trap, and the reason it is checked in a browser rather than by a source sweep.
    // A `<dialog>` is `display: none` until it is opened, by a user-agent rule about `display` —
    // and `.panel` declares `display: flex`. A dialog wearing the panel classes without
    // `modal.css` restating the rule it overrode is a dialog that renders inline, in the page
    // flow, permanently. That is invisible to a regex and obvious to a viewport, and a stylesheet
    // edit is exactly what would reintroduce it. See docs/visual-design.md, "The message family".
    await expect(dialog).toBeHidden();

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Delete' }).click();

    // There is no server copy to restore from, so the question has to carry the consequence.
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

  test('dresses the page in the open project genre, and follows a change live', async ({
    page,
  }) => {
    // docs/visual-design.md, "Applying a skin". Checked in a browser rather than by a source
    // sweep because both halves are computed relationships: which element ends up carrying the
    // attribute, and whether it follows a change without the page being reloaded.
    await projectsPage(page).getByLabel('New project').fill('Ashfall');
    await projectsPage(page).getByLabel('Genre').selectOption('fantasy');
    await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
    await expect(projectCard(page, 'Ashfall')).toBeVisible();

    const pageRegion = page.locator('main.shell__page');
    await expect(pageRegion).toHaveAttribute('data-genre', 'fantasy');

    // A skin dresses the user's work, never the app's own voice. The bar and the sidebar are the
    // page region's siblings in the shell grid, so they are neutral by position rather than by
    // opting out of anything — there is no list for anyone to forget to add to.
    await expect(page.locator('.top-bar')).not.toHaveAttribute('data-genre');
    await expect(page.locator('.sidebar')).not.toHaveAttribute('data-genre');

    // Live, with no reload in between: decision 7 in docs/workshop.md promises changing a genre
    // invalidates nothing, and a skin that only followed at load would make that visibly untrue.
    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Genre').selectOption('cyberpunk');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();

    await expect(pageRegion).toHaveAttribute('data-genre', 'cyberpunk');

    // And clearing it returns the page to the base appearance, which is the design rather than a
    // degraded mode.
    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Genre').selectOption('');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();

    await expect(pageRegion).not.toHaveAttribute('data-genre');
  });

  test('sets what a project is set in, and changes it again', async ({ page }) => {
    await projectsPage(page).getByLabel('New project').fill('Ashfall');
    await projectsPage(page).getByLabel('Genre').selectOption('fantasy');
    await projectsPage(page).getByLabel('System').selectOption('adnd-2e');
    await projectsPage(page).getByRole('button', { name: 'Create project' }).click();

    const card = projectCard(page, 'Ashfall');
    await expect(card).toContainText('Fantasy · AD&D 2E');

    // Neither choice is permanent: nothing keys off them but which tools the workshop lists, so
    // the remedy for picking wrong is a select rather than a second project.
    await card.getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Genre').selectOption('cyberpunk');
    await editingCard(page).getByLabel('System').selectOption('');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();

    await expect(projectCard(page, 'Ashfall')).toContainText('Cyberpunk · 0 artifacts');
    await expect(projectCard(page, 'Ashfall')).not.toContainText('AD&D 2E');

    // In the database rather than merely on screen.
    await page.reload({ waitUntil: 'load' });
    await expect(projectCard(page, 'Ashfall')).toContainText('Cyberpunk');
  });

  test('sets and clears a ruleset default, confirming an incompatible system change', async ({
    page,
  }) => {
    await projectsPage(page).getByLabel('New project').fill('Ashfall');
    await projectsPage(page).getByLabel('Ruleset').selectOption('ironarachne@1');
    await projectsPage(page).getByRole('button', { name: 'Create project' }).click();

    let card = projectCard(page, 'Ashfall');
    await expect(card).toContainText('Ruleset: Iron Arachne 1');

    await card.getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Ruleset').selectOption('');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();
    await expect(projectCard(page, 'Ashfall')).not.toContainText('Ruleset:');

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Ruleset').selectOption('adnd-2e@fgag-2.0.1');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();
    await expect(projectCard(page, 'Ashfall')).toContainText('AD&D 2E');
    await expect(projectCard(page, 'Ashfall')).toContainText('Ruleset: AD&D 2E fgag-2.0.1');

    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
    await editingCard(page).getByLabel('Ruleset').selectOption('ironarachne@1');
    await editingCard(page).getByLabel('System').selectOption('dnd-5e');
    await editingCard(page).getByRole('button', { name: 'Save' }).click();

    const dialog = page.locator('dialog.panel');
    await expect(dialog).toContainText('Existing artifacts will not be changed');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(editingCard(page)).toBeVisible();

    await editingCard(page).getByRole('button', { name: 'Save' }).click();
    await dialog.getByRole('button', { name: 'Change and clear' }).click();
    card = projectCard(page, 'Ashfall');
    await expect(card).toContainText('D&D 5E');
    await expect(card).not.toContainText('Ruleset:');

    await page.reload({ waitUntil: 'load' });
    await expect(projectCard(page, 'Ashfall')).toContainText('D&D 5E');
  });

  test('leaves a project set in nothing when nothing is chosen', async ({ page }) => {
    await create(page, 'A box of tools');

    // "Any genre" is the default and it means unset, not a genre called any: a generic toolbox
    // project is a legitimate thing to want.
    await expect(projectCard(page, 'A box of tools')).toContainText('0 artifacts · updated');
    await expect(projectCard(page, 'A box of tools')).not.toContainText('Any genre');
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
