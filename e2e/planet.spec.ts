import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `planet` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a planet round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a
 * referee can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the world they saved. Every step of that crosses a boundary the unit
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

const PLANET_TITLE = 'Planet Generator | Iron Arachne';

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

async function openGenerator(page: Page): Promise<void> {
  await visitRoute(page, '/planet', { title: PLANET_TITLE, webgl: true });
  await expect(page.locator('.planet')).toBeVisible();
}

test.describe('a planet', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Verge');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await openGenerator(page);

    // The generator rolls on mount (2.4), so there is a world to keep straight away.
    await saveAs(page, 'Kesh');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Kesh');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const planetName = panel.getByRole('textbox', { name: 'Planet name' });
    await planetName.fill('');
    await planetName.pressSequentially('Kesh Prime');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim. Reopened under
    // the artifact's own name, which is "Kesh": renaming the planet inside the payload is not the
    // same act as renaming the artifact, and the vault lists the latter.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Kesh');
    await expect(reopened.getByRole('textbox', { name: 'Planet name' })).toHaveValue('Kesh Prime');
  });

  test('edits a measurement without recomputing the ones derived from it', async ({ page }) => {
    // Requirement 4.2: a referee who sets a mass has made a decision, and the gravity formula sits
    // one import away from the editor. It must not be reached for.
    await openGenerator(page);
    await saveAs(page, 'Ashfall');

    const panel = await openInWorkshop(page, 'Ashfall');
    // `exact`, because a moon's fields are labelled "Moon 1 gravity (m/s²)" and an accessible name
    // matches as a substring by default. Without it this passes on a planet the seed gave no moons
    // and fails on one it did.
    const gravity = panel.getByRole('spinbutton', { name: 'Gravity (m/s²)', exact: true });
    const before = await gravity.inputValue();

    await panel.getByRole('spinbutton', { name: 'Mass (×10²⁴ kg)', exact: true }).fill('99');
    await expect(gravity).toHaveValue(before);
  });

  test('downloads a planet a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first text exports this tool has ever had — it could show a picture
    // and nothing anyone could print.
    await openGenerator(page);
    const heading = await page.locator('.planet h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain(`# ${heading}`);
    // 6.4: a planet's luminosity is always zero, so the line would be meaningless on every sheet.
    expect(contents).not.toContain('Luminosity');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('downloads the planet as a scalable image', async ({ page }) => {
    // Issue #17, arrived at from the other end: the fallback it asked for already exists as the
    // Canvas2D backend, and what SVG adds is a file a referee can print at any size.
    await openGenerator(page);

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download SVG' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.svg$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents.startsWith('<svg')).toBe(true);
    expect(contents).toContain('</svg>');
    expect(contents).not.toContain('NaN');
  });

  test('reproduces the same planet from the same seed', async ({ page }) => {
    // Requirement 2.2. The moon config seeded itself from the clock until this issue, so no seed
    // reproduced the moons however carefully the page threaded it.
    await openGenerator(page);
    const output = page.locator('.planet');

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
});
