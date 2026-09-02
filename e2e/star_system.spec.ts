import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `star-system` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a system round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a
 * referee can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the system they saved. Every step of that crosses a boundary the unit
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

const SYSTEM_TITLE = 'Star System Generator | Iron Arachne';
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

/**
 * A small system, so the editor is a page rather than a scroll.
 *
 * The count control also pins what the payload holds, which is what the reference test counts.
 */
async function generateWith(page: Page, planetCount: string): Promise<void> {
  await page.getByLabel('Planet Count').selectOption(planetCount);
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(page.locator('article.media-banner').first()).toBeVisible();
}

test.describe('a star system', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Outer Reach');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });

    // The generator rolls on mount (2.4), so there is a system to keep straight away.
    await generateWith(page, '3');
    await saveAs(page, 'Kepler');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Kepler');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const planetName = panel.getByRole('textbox', { name: 'Planet 1 name', exact: true });
    await planetName.fill('');
    await planetName.pressSequentially('Cinder');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Kepler');
    await expect(reopened.getByRole('textbox', { name: 'Planet 1 name', exact: true })).toHaveValue(
      'Cinder',
    );
  });

  test('does not re-sort the planets when an orbit is edited', async ({ page }) => {
    // Requirement 4.2, and a usability point: the generator sorts by orbit, and re-sorting under a
    // referee who has just typed would move the row they were working in.
    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });
    await generateWith(page, '3');
    await saveAs(page, 'Tannhauser');

    const panel = await openInWorkshop(page, 'Tannhauser');
    const first = panel.getByRole('textbox', { name: 'Planet 1 name', exact: true });
    const before = await first.inputValue();

    await panel
      .getByRole('spinbutton', { name: 'Planet 1 distance from star (AU)', exact: true })
      .fill('999');
    await expect(first).toHaveValue(before);
  });

  test('links a saved planet rather than copying it (5.1, 5.2)', async ({ page }) => {
    // The decision this issue asked to take: a planet the user supplied is referenced, so a system
    // holding its own copy cannot show a stale one after that planet is edited.
    await visitRoute(page, '/planet', { title: PLANET_TITLE, webgl: true });
    await saveAs(page, 'Cinder');

    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });
    await page.getByLabel('Put a saved planet in this system').check();
    await page.getByLabel('Planet', { exact: true }).selectOption({ label: 'Cinder' });
    await generateWith(page, '3');

    // On the page the system has the planet in it, and says what it did with it.
    await expect(page.locator('.referenced-note')).toBeVisible();

    await saveAs(page, 'Kepler');
    const panel = await openInWorkshop(page, 'Kepler');

    // What is stored is the planets it rolled and a link, so the editor shows one fewer.
    await expect(panel.getByRole('textbox', { name: 'Planet 3 name', exact: true })).toHaveCount(0);
    await expect(panel.getByRole('textbox', { name: 'Planet 2 name', exact: true })).toHaveCount(1);
  });

  test('downloads a system a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first text exports this tool has ever had.
    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });
    await generateWith(page, '3');
    const heading = await page.locator('h2').first().innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain(`# ${heading}`);
    // 6.4, counted rather than searched: each of these means something for one kind of body and
    // nothing for the other, so the test is that they appear on that one and not on both. One
    // star and three planets, so one luminosity line and three surface-pressure lines.
    expect(contents.match(/^- Luminosity: /gm) ?? []).toHaveLength(1);
    expect(contents.match(/^- Surface pressure: /gm) ?? []).toHaveLength(3);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('downloads the system as a scalable image', async ({ page }) => {
    // #17's half of the stellar SVG work. #16's orbital view is a different picture and stays open.
    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });
    await generateWith(page, '3');

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download SVG' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.svg$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents.startsWith('<svg')).toBe(true);
    expect(contents).toContain('</svg>');
    expect(contents).not.toContain('NaN');
  });

  test('reproduces the same system from the same seed', async ({ page }) => {
    // Requirement 2.2. The library was deterministic; what the page lacked was any record of the
    // two controls that produced a given system.
    await visitRoute(page, '/star-system', { title: SYSTEM_TITLE, webgl: true });

    // Two planets, and the body list rather than the whole page. This rolled twelve planets by
    // default and compared `section.main` three times over, so it redrew thirty-odd WebGL previews
    // to prove a claim one heading settles — and sat on the 30-second timeout doing it.
    await page.getByLabel('Planet Count').selectOption('2');
    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();

    const bodies = page.locator('article.media-banner h5');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(bodies.first()).toBeVisible();
    const first = await bodies.allInnerTexts();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await bodies.allInnerTexts()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(bodies.first()).not.toHaveText(first[0]);
  });
});
