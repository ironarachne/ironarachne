import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `encounter` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove an encounter round-trips
 * through the codec — characters and creatures both, species and archetypes by name — and that
 * each editing function changes one field; what they cannot prove is that a user can press
 * Generate, keep the result, come back to it in a different page, change something, and still
 * have the encounter they saved. Every step of that crosses a boundary the unit tests stub out —
 * the artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const ENCOUNTER_TITLE = 'Encounter | Iron Arachne';

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

test.describe('an encounter', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/encounter', { title: ENCOUNTER_TITLE });

    // The generator rolls on mount (2.4), so there is an encounter to keep straight away.
    await expect(page.locator('.mob-row').first()).toBeVisible();
    await saveAs(page, 'Ambush at the ford');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Ambush at the ford');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it
    // announces. The value is one no roll produces, so there is always something to save.
    const name = panel.getByRole('textbox', { name: 'Group 1 combatant 1 name' });
    await name.fill('');
    await name.pressSequentially('Old Tam');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Ambush at the ford');
    await expect(reopened.getByRole('textbox', { name: 'Group 1 combatant 1 name' })).toHaveValue(
      'Old Tam',
    );
  });

  test('removes a combatant and a group without touching the rest', async ({ page }) => {
    // Requirement 4.4: a group is a list, and one part changes without re-rolling the whole.
    // Three groups — a necromancer, skeleton warriors, a pack of zombies — so removing one leaves
    // something to assert on.
    await visitRoute(page, '/fantasy/encounter', { title: ENCOUNTER_TITLE });
    await page.getByLabel('Template').selectOption('necromancer and minions');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'The crypt');

    const panel = await openInWorkshop(page, 'The crypt');
    // The editor mounts through a dynamic import after the panel is visible, so the first thing
    // asserted must be one that retries; `count()` does not.
    const combatants = panel.getByRole('button', { name: /^Remove combatant \d+ from group 1$/ });
    await expect(combatants.first()).toBeVisible();
    const count = await combatants.count();
    await combatants.first().click();
    await expect(combatants).toHaveCount(count - 1);

    const groups = panel.getByRole('button', { name: /^Remove group \d+$/ });
    await expect(groups).toHaveCount(3);
    await groups.last().click();
    await expect(groups).toHaveCount(2);
    await expect(panel.getByRole('textbox', { name: /^Group \d+ name$/ })).toHaveCount(2);
  });

  test('downloads the encounter a GM can put on the table', async ({ page }) => {
    // Requirement 6.3, and the point of this tool: it had no export of any kind before.
    await visitRoute(page, '/fantasy/encounter', { title: ENCOUNTER_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    expect((await markdown).suggestedFilename()).toMatch(/\.md$/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same encounter from the same seed and settings', async ({ page }) => {
    // Requirement 2.2: the roll was already a function of seed and config; what the page lacked
    // was a seed drawn from anywhere but the clock.
    await visitRoute(page, '/fantasy/encounter', { title: ENCOUNTER_TITLE });

    const block = page.locator('.stat-block');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await block.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await block.innerText()).toEqual(first);

    // And a different seed is a different encounter, so the reproduction above is not the page
    // simply failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await block.innerText()).not.toEqual(first);
  });
});
