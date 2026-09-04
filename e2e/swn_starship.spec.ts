import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `starship.swn` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a ship round-trips through the
 * codec and that each editing function changes one field; what they cannot prove is that a user can
 * press Generate, keep the result, come back to it in a different page, change something, and still
 * have the ship they saved. Every step of that crosses a boundary the unit tests stub out — the
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

const SHIP_TITLE = 'Stars Without Number Starship Generator | Iron Arachne';

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

test.describe('a Stars Without Number starship', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Sector');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/swn/starship', { title: SHIP_TITLE });

    // The generator rolls on mount (2.4), so there is a ship to keep straight away.
    await expect(page.getByText('Owner Type')).toBeVisible();
    await saveAs(page, 'Cold Comfort');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Cold Comfort');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const manufacturer = panel.getByRole('textbox', { name: 'Manufacturer' });
    await manufacturer.fill('');
    await manufacturer.pressSequentially('Tyre Orbital Yards');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Cold Comfort');
    await expect(reopened.getByRole('textbox', { name: 'Manufacturer' })).toHaveValue(
      'Tyre Orbital Yards',
    );
  });

  test('recomputes the budget only when it is asked to', async ({ page }) => {
    // Requirement 4.2 and the design's "the budget lines recompute as an explicit command rather
    // than silently": a referee who has written a used-mass figure down has made a decision.
    await visitRoute(page, '/swn/starship', { title: SHIP_TITLE });
    await saveAs(page, 'The Long Haul');

    const panel = await openInWorkshop(page, 'The Long Haul');
    const usedMass = panel.getByRole('spinbutton', { name: 'Mass used' });
    const before = await usedMass.inputValue();

    const driveMass = panel.getByRole('spinbutton', { name: 'Drive mass' });
    await driveMass.fill('9');
    await expect(usedMass).toHaveValue(before);

    await panel.getByRole('button', { name: 'Recalculate the budget from what is fitted' }).click();
    await expect(usedMass).not.toHaveValue(before);
  });

  test('downloads the sheet a referee can take to the table', async ({ page }) => {
    // Requirement 6.3. The tool had a `.txt` download; it has a document model now, and 6.4 with
    // it — `formatAsText` printed a Weapons and a Defenses heading over nothing for every unarmed
    // merchant it rolled.
    await visitRoute(page, '/swn/starship', { title: SHIP_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain('## Budget');
    expect(contents).not.toMatch(/## (Weapons|Defenses|Fittings)\n\n(\n|$)/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same ship from the same seed', async ({ page }) => {
    // Requirement 2.2. The seed control was there and honoured; what was not reproducible was the
    // seed itself, because the page reseeded its own RNG from the field inside an `$effect` and
    // again inside `generate()`, so each press depended on the *text* of the previous one.
    await visitRoute(page, '/swn/starship', { title: SHIP_TITLE });
    const sheet = page.locator('section.main');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await sheet.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await sheet.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await sheet.innerText()).not.toEqual(first);
  });
});
