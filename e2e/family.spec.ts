import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `family` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a multi-generation family
 * round-trips through the codec — members by name, edges as ids, generators as patterns — and that
 * each editing function changes one field; what they cannot prove is that a user can press
 * Generate, keep the result, come back to it in a different page, change something, and still
 * have the family they saved. Every step of that crosses a boundary the unit tests stub out — the
 * artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const FAMILY_TITLE = 'Fantasy Family Generator | Iron Arachne';

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

/**
 * Keep whatever the tool on this page has made, under a name of its own.
 *
 * The confirmation is the button's own status line rather than a project listing: on a tool's own
 * route there is no project view to watch, which is requirement 3.7 — a tool must be savable from
 * where it lives, not only from the bench.
 */
async function saveAs(page: Page, name: string): Promise<void> {
  await saveArtifact(page).getByRole('button', { name: 'Save to project' }).click();
  await saveArtifact(page).getByLabel('Name', { exact: true }).fill(name);
  await saveArtifact(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(saveArtifact(page).getByRole('status')).toContainText(`Saved “${name}”`);
}

const vaultRow = (page: Page, name: string) =>
  vault(page).getByRole('button', { name: new RegExp(`^${name}( |$)`) });

/** Open a saved artifact in the workshop panel that edits it. */
async function openInWorkshop(page: Page, name: string) {
  await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
  await expect(vaultRow(page, name)).toBeVisible();
  await vaultRow(page, name).click();
  await inspector(page).getByRole('button', { name: 'Open in workshop' }).click();
  await page
    .locator('section.project-view')
    .getByRole('button', { name: new RegExp(`^${name}( |$)`) })
    .click();
  const panel = page.locator('.artifact-panel');
  await expect(panel).toBeVisible();
  return panel;
}

test.describe('a family', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/family', { title: FAMILY_TITLE });

    // The generator rolls on mount (2.4), so there is a family to keep straight away.
    await expect(page.locator('.member').first()).toBeVisible();
    await saveAs(page, 'House Ashford');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'House Ashford');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it
    // announces. The value is one no roll produces, so there is always something to save.
    const name = panel.getByRole('textbox', { name: 'Member 1 first name' });
    await name.fill('');
    await name.pressSequentially('Tam');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'House Ashford');
    await expect(reopened.getByRole('textbox', { name: 'Member 1 first name' })).toHaveValue('Tam');
  });

  test('removes a member and the edges that named them', async ({ page }) => {
    // Requirement 4.4: one part changes without re-rolling the whole, and 5.4: what is left still
    // reads. Three iterations of humans is always more than one person.
    await visitRoute(page, '/fantasy/family', { title: FAMILY_TITLE });
    await page.getByLabel('Species', { exact: true }).selectOption('human');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'House Kessler');

    const panel = await openInWorkshop(page, 'House Kessler');
    // The editor mounts through a dynamic import after the panel is visible, so the first thing
    // asserted must be one that retries; `count()` does not.
    const removers = panel.getByRole('button', { name: /^Remove member \d+$/ });
    await expect(removers.first()).toBeVisible();
    const count = await removers.count();
    expect(count).toBeGreaterThan(1);

    await removers.first().click();
    await expect(removers).toHaveCount(count - 1);
    await expect(panel.getByRole('textbox', { name: 'Member 1 first name' })).toBeVisible();
  });

  test('downloads the roster and the tree a GM can put on the table', async ({ page }) => {
    // Requirement 6.3: the tree was drawn all along and never offered; the roster is new.
    await visitRoute(page, '/fantasy/family', { title: FAMILY_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    expect((await markdown).suggestedFilename()).toMatch(/\.md$/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);

    const svg = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Tree (SVG)' }).click();
    expect((await svg).suggestedFilename()).toMatch(/-tree\.svg$/);
  });

  test('reproduces the same family, names included, from the same seed', async ({ page }) => {
    // Requirement 2.2: the page used to build the name generators from its own RNG, so a locked
    // seed reproduced the people and not what they were called.
    await visitRoute(page, '/fantasy/family', { title: FAMILY_TITLE });

    const family = page.locator('.family');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await family.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await family.innerText()).toEqual(first);

    // And a different seed is a different family, so the reproduction above is not the page
    // simply failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await family.innerText()).not.toEqual(first);
  });
});
