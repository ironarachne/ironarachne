import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `velgarth-gifts` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a character round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a user
 * can press Generate, keep the result, come back to it in a different page, change something, and
 * still have the character they saved. Every step of that crosses a boundary the unit tests stub
 * out — the artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const GIFTS_TITLE = 'Velgarth Gifts Generator | Iron Arachne';

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

test.describe('a set of Velgarth Gifts', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'Valdemar');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/velgarth-gifts', { title: GIFTS_TITLE });

    // The generator rolls on mount (2.4), so there is a set to keep straight away.
    await expect(page.locator('.gift').first()).toBeVisible();
    await saveAs(page, 'Talia’s Gifts');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Talia’s Gifts');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it
    // announces. The value is one no roll produces, so there is always something to save.
    const description = panel.getByRole('textbox', { name: 'What it does' }).first();
    await description.fill('');
    await description.pressSequentially('She hears the horses.');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Talia’s Gifts');
    await expect(reopened.getByRole('textbox', { name: 'What it does' }).first()).toHaveValue(
      'She hears the horses.',
    );
  });

  test('changes a strength without rewriting what the Gift does', async ({ page }) => {
    // Requirement 4.2: the strength and the prose are separate decisions, and a form that silently
    // replaced a user's sentence with the table's would overrule them.
    await visitRoute(page, '/velgarth-gifts', { title: GIFTS_TITLE });
    await saveAs(page, 'Herald Gifts');

    const panel = await openInWorkshop(page, 'Herald Gifts');
    const description = panel.getByRole('textbox', { name: 'What it does' }).first();
    const before = await description.inputValue();

    await panel.getByLabel('Strength', { exact: true }).first().selectOption('5');
    await expect(description).toHaveValue(before);

    // A Gift can be added and taken away again, which is what makes this a list and not a form.
    await panel.getByRole('button', { name: 'Add a Gift' }).click();
    const added = panel.getByRole('button', { name: /^Remove Gift \d+$/ });
    const count = await added.count();
    await added.last().click();
    await expect(added).toHaveCount(count - 1);
  });

  test('downloads the Gifts a player can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first export this tool has ever had.
    await visitRoute(page, '/velgarth-gifts', { title: GIFTS_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    expect((await markdown).suggestedFilename()).toMatch(/\.md$/);
  });

  test('reproduces the same Gifts from the same seed', async ({ page }) => {
    // Requirement 2.2: the page built a fresh clock-seeded RNG on every press to take one string
    // from it, which is the same defect the rest of the pass found wearing a smaller coat.
    await visitRoute(page, '/velgarth-gifts', { title: GIFTS_TITLE });

    const gifts = page.locator('.gift');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await gifts.allInnerTexts();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await gifts.allInnerTexts()).toEqual(first);

    // And a different seed is a different set, so the reproduction above is not the page simply
    // failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await gifts.allInnerTexts()).not.toEqual(first);
  });
});
