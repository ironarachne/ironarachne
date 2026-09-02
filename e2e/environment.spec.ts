import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `environment` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove an environment round-trips
 * through the codec and that each editing function changes one field; what they cannot prove is
 * that a referee can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the place they saved. Every step of that crosses a boundary the unit
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

const ENVIRONMENT_TITLE = 'Environment Generator | Iron Arachne';

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

test.describe('an environment', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Cold Coast');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/environment', { title: ENVIRONMENT_TITLE });

    // The generator rolls on mount (2.4), so there is a place to keep straight away.
    await expect(page.locator('.environment')).toBeVisible();
    await saveAs(page, 'The Saltmarsh');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Saltmarsh');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const biomeName = panel.getByRole('textbox', { name: 'Biome name' });
    await biomeName.fill('');
    await biomeName.pressSequentially('drowned fen');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Saltmarsh');
    await expect(reopened.getByRole('textbox', { name: 'Biome name' })).toHaveValue('drowned fen');
  });

  test('edits a measurement without reclassifying anything around it', async ({ page }) => {
    // Requirement 4.2: the edited payload is authoritative. Raising the humidity must not silently
    // pick a different biome, which is what a generator would do with the same number.
    await visitRoute(page, '/environment', { title: ENVIRONMENT_TITLE });
    await saveAs(page, 'The Dry Reach');

    const panel = await openInWorkshop(page, 'The Dry Reach');
    const biomeName = await panel.getByRole('textbox', { name: 'Biome name' }).inputValue();

    await panel.getByRole('spinbutton', { name: 'Biome humidity (0 to 1)' }).fill('0.95');
    await expect(panel.getByRole('textbox', { name: 'Biome name' })).toHaveValue(biomeName);
  });

  test('downloads an environment a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first export this tool has ever had.
    await visitRoute(page, '/environment', { title: ENVIRONMENT_TITLE });
    const heading = await page.locator('.environment h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain(`# ${heading}`);
    // 6.4: `Ecosystems.generate` is a stub, so an Ecosystem heading would be empty on every sheet.
    expect(contents).not.toContain('## Ecosystem');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same environment from the same seed', async ({ page }) => {
    // Requirement 2.2. The library was deterministic given a config; what the page lacked was any
    // record of the eleven numbers that made one, which `environment_roll.ts` now owns.
    await visitRoute(page, '/environment', { title: ENVIRONMENT_TITLE });
    const output = page.locator('.environment');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await output.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await output.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await output.innerText()).not.toEqual(first);
  });

  test('randomizing the parameters does not move what the seed produces', async ({ page }) => {
    // The button used to draw from the same stream the environment was rolled from, so what
    // Generate produced depended on how many times Randomize had been pressed.
    await visitRoute(page, '/environment', { title: ENVIRONMENT_TITLE });
    await page.getByLabel('Seed', { exact: true }).fill('stable-seed');
    await page.getByLabel('Lock Seed').check();

    await page.getByRole('button', { name: 'Randomize Parameters' }).click();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await page.locator('.environment').innerText();

    await page.getByRole('button', { name: 'Randomize Parameters' }).click();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await page.locator('.environment').innerText()).toEqual(first);
  });
});
