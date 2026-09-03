import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `potion` kind: generate, save, reopen, edit (#68).
 *
 * This is the half no unit test can settle. The library tests prove a potion round-trips through
 * the codec and that each edit changes one thing; what they cannot prove is that a referee can
 * press Generate, keep the potion, come back to it in a different page, rewrite what it tastes of,
 * and still have the potion they saved.
 *
 * The kind is its own rather than a share of `item` — decision 2 of docs/readiness-objects.md, and
 * a correction to what this issue assumed. The editor's sensory and effect fields are what that
 * decision buys, so they are what these tests drive.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const POTION_TITLE = 'Potion Generator | Iron Arachne';

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');
const result = (page: Page) => page.locator('.potion-result');

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
 * Keep whatever the tool has made, under a name of its own.
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

/** A pinned press, so the potion on screen is the same one every run. */
async function generatePinned(page: Page, seed = 'a-fixed-seed'): Promise<void> {
  await page.getByLabel('Seed', { exact: true }).fill(seed);
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(result(page)).toBeVisible();
}

test.describe('a potion', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Alchemist');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });

    // The generator rolls on mount (2.4), so there is a potion to keep straight away.
    await expect(result(page)).toBeVisible();
    await saveAs(page, 'The Green Vial');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Green Vial');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces.
    const flavor = panel.getByRole('textbox', { name: 'Flavor' });
    await flavor.fill('');
    await flavor.pressSequentially('like cold iron');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Green Vial');
    await expect(reopened.getByRole('textbox', { name: 'Flavor' })).toHaveValue('like cold iron');
  });

  test('reaches the fields an item editor has no place for', async ({ page }) => {
    // Decision 2 of docs/readiness-objects.md as a user meets it: the sensory profile and the
    // effect are why a potion is its own kind rather than a share of `item`.
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Blue Flask');

    const panel = await openInWorkshop(page, 'The Blue Flask');
    for (const label of ['Appearance', 'Viscosity', 'Flavor', 'Scent', 'Effect name']) {
      await expect(panel.getByRole('textbox', { name: label })).toBeVisible();
    }
    await expect(panel.getByRole('spinbutton', { name: 'Magnitude' })).toBeVisible();

    await panel.getByRole('textbox', { name: 'Effect name' }).fill('Reconsideration');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Blue Flask');
    await expect(reopened.getByRole('textbox', { name: 'Effect name' })).toHaveValue(
      'Reconsideration',
    );
  });

  test('offers the description rather than rewriting it under the user', async ({ page }) => {
    // Requirement 4.2. The prose is composed from the name, the senses and the effect, so a form
    // that regenerated it on every keystroke would throw away a hand-written one.
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Written Draught');

    const panel = await openInWorkshop(page, 'The Written Draught');
    const description = panel.getByRole('textbox', { name: 'Potion description' });
    await description.fill('A judge wrote this by hand.');

    // Unmoved: changing a field the description is built from did not touch it.
    await panel.getByRole('textbox', { name: 'Scent' }).fill('of wet slate');
    await expect(description).toHaveValue('A judge wrote this by hand.');

    // And the generated wording is there for the asking.
    await panel.getByRole('button', { name: 'Rewrite the description from the fields' }).click();
    // `toHaveValue`, not `toContainText`: a textarea's edited value is not its text content.
    await expect(description).toHaveValue(/wet slate/);
  });

  test('does not reprice the potion when the magnitude changes', async ({ page }) => {
    // 4.2 again, and the sharpest temptation here: the value is derived from the catalog entry and
    // the effect, so re-running that arithmetic would overwrite a price set by hand.
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Priced Vial');

    const panel = await openInWorkshop(page, 'The Priced Vial');
    const value = panel.getByRole('spinbutton', { name: 'Value (cp)' });
    await value.fill('250');

    await panel.getByRole('spinbutton', { name: 'Magnitude' }).fill('90');
    await expect(value).toHaveValue('250');
  });

  test('downloads a potion a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });
    await generatePinned(page);
    const name = await result(page).locator('h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toMatch(/^potion-.*\.md$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain(`# ${name}`);
    expect(contents).toContain('## Effect');
    expect(contents).toContain('## Sensory profile');
    expect(contents).toContain('## Container');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/^potion-.*\.pdf$/);
  });

  test('reproduces the same potion from the same seed', async ({ page }) => {
    // Requirement 2.2. The page built a fresh `RNG(Date.now())` inside every press to draw the next
    // seed, so the control was honoured and the seeds themselves came from the clock.
    await visitRoute(page, '/fantasy/potion-generator', { title: POTION_TITLE });

    await generatePinned(page, 'a-fixed-seed');
    const first = await result(page).innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).not.toEqual(first);
  });
});
