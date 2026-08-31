import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `character` kind: generate, save, reopen, edit.
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

const CHARACTER_TITLE = 'Character | Iron Arachne';

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

test.describe('a fantasy character', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });

    // The generator rolls on mount (2.4), so there is a character to keep straight away.
    await expect(page.getByRole('button', { name: 'Generate', exact: true })).toBeVisible();
    await saveAs(page, 'Maren Voss');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Maren Voss');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it announces.
    const description = panel.getByRole('textbox', { name: 'Description', exact: true });
    await description.click();
    await description.pressSequentially(' Keeps the tide charts.');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Maren Voss');
    await expect(reopened.getByRole('textbox', { name: 'Description', exact: true })).toHaveValue(
      /Keeps the tide charts\./,
    );
  });

  test('renames the character through both halves of the name', async ({ page }) => {
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });
    await saveAs(page, 'Someone Unnamed');

    const panel = await openInWorkshop(page, 'Someone Unnamed');
    await panel.getByRole('textbox', { name: 'First name' }).fill('Perrin');
    await panel.getByRole('textbox', { name: 'Last name' }).fill('Thistlewood');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  test('shows species read-only, because nothing recomputes the build it produced', async ({
    page,
  }) => {
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });
    await saveAs(page, 'Fixed Species');

    const panel = await openInWorkshop(page, 'Fixed Species');
    await expect(panel.getByText(/^Species:/)).toBeVisible();
    await expect(panel.getByRole('combobox', { name: 'Species' })).toHaveCount(0);
    // Gender is editable, which is what makes the species decision a decision rather than an
    // omission.
    await expect(panel.getByRole('combobox', { name: 'Gender' })).toBeVisible();
  });

  test('reproduces the same character from the same seed', async ({ page }) => {
    // Requirement 2.2, and the defect `character_roll.ts` was written to fix: the generator used to
    // reseed from the clock inside every roll and to name from a clock-seeded RNG, so a locked seed
    // reproduced neither the body nor the name.
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });

    const heading = page.getByRole('heading', { level: 2 }).first();

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await heading.textContent();
    const description = await page
      .getByText(/years old|of \d+ years/)
      .first()
      .textContent();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(heading).toHaveText(first ?? '');
    await expect(page.getByText(/years old|of \d+ years/).first()).toHaveText(description ?? '');

    // And a different seed is a different person, so the reproduction above is not the page simply
    // failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(heading).not.toHaveText(first ?? '');
  });

  test('offers a project culture to name from, and only once there is one', async ({ page }) => {
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });

    // No cultures in the project, so no offer. An offer with nothing behind it is noise, and
    // requirement 5.3 is what makes its absence correct rather than a gap: the tool generates its
    // own names and saves perfectly well without one.
    await expect(page.getByLabel('Name from a saved culture in this project')).toHaveCount(0);

    await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });
    await saveAs(page, 'The Emberfolk');

    await visitRoute(page, '/character', { title: CHARACTER_TITLE });

    // Composition is opt-in (rule 1): the offer is there and starts unticked.
    const offer = page.getByLabel('Name from a saved culture in this project');
    await expect(offer).toBeVisible();
    await expect(offer).not.toBeChecked();
  });

  test('offers a saved coat of arms, and only once there is one', async ({ page }) => {
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });
    await expect(page.getByLabel('Give this character a saved coat of arms')).toHaveCount(0);

    await visitRoute(page, '/heraldry', { title: 'Heraldry Generator | Iron Arachne' });
    await saveAs(page, 'Azure, a bend or');

    await visitRoute(page, '/character', { title: CHARACTER_TITLE });
    const offer = page.getByLabel('Give this character a saved coat of arms');
    await expect(offer).toBeVisible();
    await expect(offer).not.toBeChecked();
  });

  test('downloads a character sheet a user can take to the table', async ({ page }) => {
    // Requirement 6.3. These are the presentation exports, distinct from artifact export.
    await visitRoute(page, '/character', { title: CHARACTER_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    expect((await markdown).suggestedFilename()).toMatch(/\.md$/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download PDF/ }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });
});
