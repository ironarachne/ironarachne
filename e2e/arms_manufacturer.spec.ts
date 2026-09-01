import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `arms-manufacturer` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a manufacturer round-trips
 * through the codec and that each editing function changes one field; what they cannot prove is
 * that a user can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the company they saved. Every step of that crosses a boundary the unit
 * tests stub out — the artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const ARMS_TITLE = 'Arms Manufacturer Generator | Iron Arachne';

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

test.describe('an arms manufacturer', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'Outer Rim');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/arms-manufacturer', { title: ARMS_TITLE });

    // The generator rolls on mount (2.4), so there is a company to keep straight away.
    await expect(page.locator('.model').first()).toBeVisible();
    await saveAs(page, 'Vex Heavy Industries');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Vex Heavy Industries');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it
    // announces. The value is one no roll produces, so there is always something to save.
    const description = panel.getByRole('textbox', { name: 'Model description' }).first();
    await description.fill('');
    await description.pressSequentially('It fires backwards.');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Vex Heavy Industries');
    await expect(reopened.getByRole('textbox', { name: 'Model description' }).first()).toHaveValue(
      'It fires backwards.',
    );
  });

  test('renames the company without rewriting its description', async ({ page }) => {
    // Requirement 4.2: the name and the prose are separate decisions, and a form that silently
    // rewrote the sentence that opens with the old name would overrule the user.
    await visitRoute(page, '/arms-manufacturer', { title: ARMS_TITLE });
    await saveAs(page, 'Kessler Arms');

    const panel = await openInWorkshop(page, 'Kessler Arms');
    const description = panel.getByRole('textbox', { name: 'Company description' });
    const before = await description.inputValue();

    await panel.getByRole('textbox', { name: 'Company name' }).fill('Kessler Applied Sciences');
    await expect(description).toHaveValue(before);

    // A model can be added and taken away again, which is what makes the catalogue a list and not
    // a form.
    await panel.getByRole('button', { name: 'Add a model' }).click();
    const removers = panel.getByRole('button', { name: /^Remove model \d+$/ });
    const count = await removers.count();
    await removers.last().click();
    await expect(removers).toHaveCount(count - 1);
  });

  test('downloads the catalogue a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/arms-manufacturer', { title: ARMS_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    expect((await markdown).suggestedFilename()).toMatch(/\.md$/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same manufacturer from the same seed', async ({ page }) => {
    // Requirement 2.2 and 2.3: the page had no seed control at all and called `Date.now()` three
    // times, so nothing it produced could be reproduced by anyone.
    await visitRoute(page, '/arms-manufacturer', { title: ARMS_TITLE });

    const manufacturer = page.locator('.manufacturer');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await manufacturer.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await manufacturer.innerText()).toEqual(first);

    // And a different seed is a different company, so the reproduction above is not the page
    // simply failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await manufacturer.innerText()).not.toEqual(first);
  });
});
