import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `dungeon` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a dungeon round-trips through
 * the codec and that each editing function changes one field without disturbing its neighbours;
 * what they cannot prove is that a referee can press Generate, keep the result, come back to it in
 * a different page, change a room, and still have the dungeon they saved. Every step of that
 * crosses a boundary the unit tests stub out — the artifact store, IndexedDB, the editor registry,
 * and a page reload — and this is the largest payload the store has ever been asked to hold.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const DUNGEON_TITLE = 'Dungeon Generator | Iron Arachne';

/**
 * A small map, set before every generate in these tests.
 *
 * The page defaults to 40×60, which rolls forty-odd rooms with an encounter in half of them — a
 * quarter-megabyte payload and a very long editor. Nothing here is testing size, so the tests take
 * the smallest map the page offers and spend their time on the round trip instead.
 */
async function useASmallMap(page: Page): Promise<void> {
  await page.getByLabel('Map width').fill('20');
  await page.getByLabel('Map height').fill('20');
}

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

/** The first room's own fields, which every dungeon has at least one of. */
const firstRoomName = (
  panel: ReturnType<typeof openInWorkshop> extends Promise<infer T> ? T : never,
) => panel.getByRole('textbox', { name: /^Room \S+ name$/ }).first();

test.describe('a dungeon', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Northern Marches');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/dungeon', { title: DUNGEON_TITLE });

    // The generator rolls on mount (2.4), so there is a dungeon on screen before anything is
    // pressed; the small map is rolled deliberately over the top of it.
    await expect(page.locator('.room').first()).toBeVisible();
    await useASmallMap(page);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('.room').first()).toBeVisible();

    await saveAs(page, 'The Barrow of Ash');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Barrow of Ash');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const roomName = firstRoomName(panel);
    await roomName.fill('');
    await roomName.pressSequentially('The Cold Gate');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Barrow of Ash');
    await expect(firstRoomName(reopened)).toHaveValue('The Cold Gate');
  });

  test('rethemes without re-rolling the rooms it already has', async ({ page }) => {
    // Requirement 4.2: the edited payload is authoritative. Retheming relabels the dungeon; the
    // rooms a referee has already read stay exactly as they were.
    await visitRoute(page, '/fantasy/dungeon', { title: DUNGEON_TITLE });
    await useASmallMap(page);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'The Sunken Hold');

    const panel = await openInWorkshop(page, 'The Sunken Hold');
    const roomName = await firstRoomName(panel).inputValue();

    await panel.getByLabel('Blueprint').selectOption('Arcane Library');
    await expect(firstRoomName(panel)).toHaveValue(roomName);
  });

  test('downloads a dungeon a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first text exports this tool has ever had — it could produce a
    // picture of the map and nothing a referee could read from.
    await visitRoute(page, '/fantasy/dungeon', { title: DUNGEON_TITLE });
    await useASmallMap(page);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const firstRoom = await page.locator('.room').first().locator('h3').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    // The heading on the page reads "Name (room 3)"; the export heads the same room the same way.
    expect(contents.toLowerCase()).toContain(firstRoom.split('(')[0].trim().toLowerCase());

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same dungeon from the same seed', async ({ page }) => {
    // Requirement 2.2. The library was already a pure function of its config; the environment step
    // that fed it lived in the component, which is what `dungeon_roll.ts` took over.
    await visitRoute(page, '/fantasy/dungeon', { title: DUNGEON_TITLE });
    await useASmallMap(page);

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const rooms = page.locator('.room');
    const first = await rooms.first().innerText();
    const count = await rooms.count();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await rooms.count()).toEqual(count);
    expect(await rooms.first().innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await rooms.first().innerText()).not.toEqual(first);
  });

  test('says what keeping a dungeon will cost before it is kept', async ({ page }) => {
    // The measurement decision 7 of docs/tool-readiness.md asked this issue to take, reaching the
    // user: this is the only payload on the site that can run to megabytes.
    await visitRoute(page, '/fantasy/dungeon', { title: DUNGEON_TITLE });
    await useASmallMap(page);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('.stored-size')).toContainText(/\d+(\.\d+)? (KB|MB)/);
  });
});
