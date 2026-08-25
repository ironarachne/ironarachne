import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the AD&D 2E character kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a character round-trips
 * through the codec and that the builder patches rather than re-derives; what they cannot prove is
 * that a user can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the character they saved. Every step of that crosses a boundary the
 * unit tests stub out — the artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

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

/**
 * Drive the builder to a complete human fighter.
 *
 * A fighter deliberately: casters must have their level 1 spells chosen and rogues their skill
 * points allocated before a character appears, and neither is what these tests are about. Human
 * because its ability ranges accept any roll, so the race is always on offer.
 */
async function chooseFighter(page: Page): Promise<void> {
  // Rolled until a fighter is on offer. The builder's dice are its own — there is no seed control
  // on this page — and straight 3d6 sometimes qualifies for no class at all, which is real
  // behaviour rather than a fault. Re-rolling is what a user would do.
  const race = page.getByRole('combobox', { name: 'Race' });
  const cls = page.getByRole('combobox', { name: 'Class' });

  for (let attempt = 0; attempt < 25; attempt += 1) {
    await page.getByRole('button', { name: 'Roll 6 × 3d6' }).click();
    await expect(race).toBeVisible();
    await race.selectOption('human');
    const classes = await cls.locator('option').allTextContents();
    if (classes.includes('fighter')) {
      break;
    }
  }

  await expect(cls).toBeVisible();
  await cls.selectOption('fighter');

  const alignment = page.getByRole('combobox', { name: 'Alignment' });
  await expect(alignment).toBeVisible();
  await alignment.selectOption({ index: 1 });
}

/** A culture in the open project, so the naming picker has something to offer. */
async function saveACulture(page: Page, name: string): Promise<void> {
  await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });
  await saveAs(page, name);
}

test.describe('an AD&D 2E character', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'Greyhawk');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/adnd/character', {
      title: 'AD&D 2e Character Generator | Iron Arachne',
    });

    // The generator rolls on mount, so there is a character to keep straight away.
    await expect(page.getByRole('heading', { name: 'Attributes' })).toBeVisible();
    await saveAs(page, 'Aldric Vane');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability
    // test rather than a state test.
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
    await expect(vaultRow(page, 'Aldric Vane')).toBeVisible();
    await vaultRow(page, 'Aldric Vane').click();

    // The kind's editor is the builder itself, so the artifact opens into the tool that makes
    // characters rather than into a generic snapshot view — which is what makes editing it the
    // same act as building one.
    await inspector(page).getByRole('button', { name: 'Open in workshop' }).click();
    await page
      .locator('section.project-view')
      .getByRole('button', { name: /^Aldric Vane( |$)/ })
      .click();
    const panel = page.locator('.artifact-panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { name: /AD&D 2e Character Builder/ })).toBeVisible();

    // Editing it marks the artifact dirty, which is the framework noticing that the builder
    // announced a different snapshot than the one it was handed.
    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion
    // is that the builder's own bindings carry a user's keystrokes through to the snapshot it
    // announces.
    const firstName = panel.getByRole('textbox', { name: 'First name' });
    await firstName.click();
    await firstName.pressSequentially('Aldrich');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  test('is built by hand, saved, and reopened', async ({ page }) => {
    await visitRoute(page, '/fantasy/adnd/character/build', {
      title: 'AD&D 2e Character Builder | Iron Arachne',
    });

    // Every control is reached by its accessible *role and name*, which is requirement 6.2 tested
    // rather than asserted: a control that cannot be found that way is a control a screen reader
    // cannot announce.
    await page.getByRole('button', { name: 'Roll 6 × 3d6' }).click();

    await chooseFighter(page);

    // A character only appears once every required choice is made, so its presence is the proof
    // that the form was driven entirely through accessible names.
    const sheet = page.locator('.builder-result');
    await expect(sheet.getByRole('heading', { name: 'Character' })).toBeVisible();

    await saveAs(page, 'Perrin Thistlewood');

    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
    await expect(vaultRow(page, 'Perrin Thistlewood')).toBeVisible();
  });

  test('exposes its derived numbers for correction', async ({ page }) => {
    // Requirement 4.1: every field displayed is a field a user may change. The derived block used
    // to be computed and unreachable.
    await visitRoute(page, '/fantasy/adnd/character/build', {
      title: 'AD&D 2e Character Builder | Iron Arachne',
    });

    await chooseFighter(page);

    // `<details>` is natively keyboard-operable, so reaching it by role is the whole check.
    await page.getByRole('group', { name: 'Details' }).click();

    await expect(page.getByLabel('THAC0')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Recalculate from race, class, and attributes' }),
    ).toBeVisible();
  });

  test('offers a project culture to name from, and only once there is one', async ({ page }) => {
    await visitRoute(page, '/fantasy/adnd/character', {
      title: 'AD&D 2e Character Generator | Iron Arachne',
    });

    // No cultures in the project, so no offer. An offer with nothing behind it is noise, and
    // requirement 5.3 is what makes its absence correct rather than a gap: the tool generates its
    // own names and saves perfectly well without one.
    await expect(page.getByLabel('Name from a saved culture in this project')).toHaveCount(0);
    await saveAs(page, 'Unnamed Wanderer');

    await saveACulture(page, 'The Emberfolk');

    await visitRoute(page, '/fantasy/adnd/character', {
      title: 'AD&D 2e Character Generator | Iron Arachne',
    });

    // Composition is opt-in (rule 1): the offer is there and starts unticked.
    const offer = page.getByLabel('Name from a saved culture in this project');
    await expect(offer).toBeVisible();
    await expect(offer).not.toBeChecked();
  });

  test('downloads a character sheet a user can take to the table', async ({ page }) => {
    // Requirement 6.3. The PDF is the presentation export, distinct from artifact export.
    await visitRoute(page, '/fantasy/adnd/character', {
      title: 'AD&D 2e Character Generator | Iron Arachne',
    });

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download PDF/ }).click();

    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
  });
});
