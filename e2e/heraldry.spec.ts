import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `heraldry` kind: generate, save, reopen, edit.
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

const HERALDRY_TITLE = 'Heraldry Generator | Iron Arachne';

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

test.describe('a coat of arms', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/heraldry', { title: HERALDRY_TITLE });

    // The generator rolls on mount (2.4), so there is a coat of arms to keep straight away.
    await expect(page.locator('p.blazon')).not.toBeEmpty();
    await saveAs(page, 'Emberhold arms');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Emberhold arms');

    // The editor is a form over the names the device is stored as, and it draws the arms beside
    // the controls — the affordance the viewer it replaced had.
    await expect(panel.locator('.heraldry-artifact__device > svg')).toBeVisible();

    const before = await panel.locator('.heraldry-artifact__blazon').innerText();
    await panel.getByLabel('Division', { exact: true }).selectOption('pall');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();

    // The blazon is derived, so it followed the edit rather than describing arms that are gone.
    await expect(panel.locator('.heraldry-artifact__blazon')).not.toHaveText(before);
    await expect(panel.locator('.heraldry-artifact__blazon')).toContainText('per pall');

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Emberhold arms');
    await expect(reopened.getByLabel('Division', { exact: true })).toHaveValue('pall');
    await expect(reopened.locator('.heraldry-artifact__blazon')).toContainText('per pall');
  });

  test('changes one part of the device without disturbing the rest', async ({ page }) => {
    // Requirement 4.4. A charge group is a repeating structure with its own add and remove, which
    // is why this is not a flat form — and why "one part at a time" is worth asserting in a
    // browser rather than only in the library.
    await visitRoute(page, '/heraldry', { title: HERALDRY_TITLE });
    await page.getByLabel('Number of Charges').selectOption('one');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'Marcher arms');

    const panel = await openInWorkshop(page, 'Marcher arms');
    const division = panel.getByLabel('Division', { exact: true });
    const field = await division.inputValue();

    await panel.getByLabel('Charge tincture', { exact: true }).selectOption('purpure');
    await expect(panel.locator('.heraldry-artifact__blazon')).toContainText('purpure');
    // The field is untouched: changing the charge's tincture is not a re-roll.
    await expect(division).toHaveValue(field);

    // And a charge group can be added and taken away again.
    await panel.getByRole('button', { name: 'Add a charge group' }).click();
    await expect(panel.getByRole('button', { name: /^Remove charge group 2$/ })).toBeVisible();
    await panel.getByRole('button', { name: /^Remove charge group 2$/ }).click();
    await expect(panel.getByRole('button', { name: /^Remove charge group 2$/ })).toHaveCount(0);
  });

  test('downloads a saved coat of arms as SVG and as PNG', async ({ page }) => {
    // Requirement 6.3, from the editing panel rather than the generator: downloading a *saved*
    // coat of arms is not the same as downloading the one the generator happens to be showing.
    await visitRoute(page, '/heraldry', { title: HERALDRY_TITLE });
    await saveAs(page, 'Downloadable arms');

    const panel = await openInWorkshop(page, 'Downloadable arms');

    const [svg] = await Promise.all([
      page.waitForEvent('download'),
      panel.getByRole('button', { name: 'Download SVG' }).click(),
    ]);
    expect(svg.suggestedFilename()).toMatch(/^heraldry-.+\.svg$/);

    const [png] = await Promise.all([
      page.waitForEvent('download'),
      panel.getByRole('button', { name: 'Download PNG' }).click(),
    ]);
    expect(png.suggestedFilename()).toMatch(/^heraldry-.+\.png$/);
  });

  test('reproduces the same arms from the same seed', async ({ page }) => {
    // Requirement 2.2, and what `heraldry_roll.ts` was extracted for: assembling the generator
    // config draws from the RNG, so a page that assembled it inline was half of what a seed
    // reproduced.
    await visitRoute(page, '/heraldry', { title: HERALDRY_TITLE });

    const blazon = page.locator('p.blazon');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await blazon.textContent();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(blazon).toHaveText(first ?? '');

    // And a different seed is a different coat of arms, so the reproduction above is not the page
    // simply failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(blazon).not.toHaveText(first ?? '');
  });
});
