import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `region` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a region round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a
 * referee can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the region they saved. Every step of that crosses a boundary the unit
 * tests stub out — the artifact store, IndexedDB, the editor registry, and a page reload. A region
 * is the most composed payload on the site, so it is also the heaviest thing the store carries.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const REGION_TITLE = 'Region Generator | Iron Arachne';

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
  await expect(saveArtifact(page).getByRole('status')).toContainText(`Saved “${name}”`, {
    timeout: 30_000,
  });
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
  await expect(panel).toBeVisible({ timeout: 30_000 });
  return panel;
}

async function openGenerator(page: Page): Promise<void> {
  await visitRoute(page, '/region', { title: REGION_TITLE });
  await expect(page.locator('img.region-map')).toBeVisible({ timeout: 30_000 });
}

test.describe('a region', () => {
  // A region composes a culture, a map, settlements, organizations and four kinds of character, so
  // both rolling one and storing one take longer than anything else in this suite.
  test.slow();

  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await openGenerator(page);

    // The generator rolls on mount (2.4), so there is a region to keep straight away.
    await saveAs(page, 'The Cold Marches');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Cold Marches');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const realmName = panel.getByRole('textbox', { name: 'Realm 1 name', exact: true });
    await realmName.fill('');
    await realmName.pressSequentially('Ashmarch');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Cold Marches');
    await expect(reopened.getByRole('textbox', { name: 'Realm 1 name', exact: true })).toHaveValue(
      'Ashmarch',
    );
  });

  test('moves the seat without rewriting the prose that named the old one', async ({ page }) => {
    // Requirement 4.2: the description may have been rewritten by hand, and a generator that
    // quietly corrects it is regenerating over the user's work.
    await openGenerator(page);
    await saveAs(page, 'Riverlands');

    const panel = await openInWorkshop(page, 'Riverlands');
    const description = panel.getByRole('textbox', { name: 'Region description' });
    const before = await description.inputValue();

    const seat = panel.getByLabel('Seat of the region');
    const options = await seat.locator('option').all();
    expect(options.length).toBeGreaterThan(1);
    await seat.selectOption({ index: options.length - 1 });

    await expect(description).toHaveValue(before);
  });

  test('shows the map and downloads it, which is what a region is', async ({ page }) => {
    // Requirement 6.3. `region_map_svg.ts` had existed the whole time with one caller, a CLI
    // script, and the page never drew the map at all.
    await openGenerator(page);
    await expect(page.locator('img.region-map')).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Map (SVG)' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.svg$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents.startsWith('<?xml')).toBe(true);
    expect(contents).toContain('</svg>');
    expect(contents).not.toContain('NaN');
  });

  test('downloads a gazetteer a referee can take to the table', async ({ page }) => {
    await openGenerator(page);
    const heading = await page.locator('section.main h2').first().innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents.toLowerCase()).toContain(heading.toLowerCase());
    expect(contents).toContain('## Realms');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same region from the same seed', async ({ page }) => {
    // Requirement 2.2, and the defect the library carried: `getDefaultConfig` seeded both its RNG
    // and its fallback name generator set from the clock, so no seed reproduced a region's names.
    await openGenerator(page);

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const heading = page.locator('section.main h2').first();
    const first = await heading.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).not.toEqual(first);
  });
});
