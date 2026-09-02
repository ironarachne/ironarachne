import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `star-nation` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a nation round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a
 * user can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the nation they saved. Every step of that crosses a boundary the unit
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

const NATION_TITLE = 'Star Nation Generator | Iron Arachne';

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

test.describe('a star nation', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'Outer Rim');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/star-nation', { title: NATION_TITLE });

    // The generator rolls on mount (2.4), so there is a nation to keep straight away.
    await expect(page.locator('.nation h2')).toBeVisible();
    await saveAs(page, 'Kingdom of Vesh');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Kingdom of Vesh');

    // Typed rather than filled: `fill` sets the value in one go, and the point of this assertion is
    // that the editor's own bindings carry a user's keystrokes through to the snapshot it
    // announces. The value is one no roll produces, so there is always something to save.
    const description = panel.getByRole('textbox', { name: 'Nation description' });
    await description.fill('');
    await description.pressSequentially('They are mostly harmless.');
    await panel.getByRole('combobox', { name: 'Economy type' }).selectOption('Barter');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Kingdom of Vesh');
    await expect(reopened.getByRole('textbox', { name: 'Nation description' })).toHaveValue(
      'They are mostly harmless.',
    );
    await expect(reopened.getByRole('combobox', { name: 'Economy type' })).toHaveValue('Barter');
  });

  test('changes a figure without rewriting the description, until asked', async ({ page }) => {
    // Requirement 4.2: the figures and the prose are separate decisions, and a form that silently
    // rewrote the sentence would overrule the user. The rewrite is a button, which is 4.4's "one
    // part without the whole" for the one field that is derived from the others.
    await visitRoute(page, '/star-nation', { title: NATION_TITLE });
    await saveAs(page, 'Vesh Dominion');

    const panel = await openInWorkshop(page, 'Vesh Dominion');
    const description = panel.getByRole('textbox', { name: 'Nation description' });
    const before = await description.inputValue();

    await panel.getByRole('combobox', { name: 'Government type' }).selectOption('Theocracy');
    await expect(description).toHaveValue(before);

    await panel.getByRole('button', { name: 'Rewrite description from the figures' }).click();
    await expect(description).toHaveValue(/theocratic/);

    // Moving the homeworld is a select over the system's own planets.
    const homePlanet = panel.getByRole('combobox', { name: 'Home planet' });
    const options = await homePlanet.locator('option').allTextContents();
    if (options.length > 1) {
      await homePlanet.selectOption({ index: options.length - 1 });
      await expect(homePlanet).toHaveValue(String(options.length - 1));
    }
  });

  test('downloads the nation a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/star-nation', { title: NATION_TITLE });

    const heading = await page.locator('.nation h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    // And it is this nation, not a template: the file opens with the name on the page.
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents.startsWith(`# ${heading}`)).toBe(true);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same nation from the same seed', async ({ page }) => {
    // Requirement 2.2: the page threaded one RNG through every config, but each config had seeded
    // itself from the clock first, and the preview took a seed drawn after the roll.
    await visitRoute(page, '/star-nation', { title: NATION_TITLE });

    const nation = page.locator('.nation');
    const composite = nation.locator('.image-container-system img');

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByLabel('Planet Count').selectOption('4');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await nation.innerText();
    await expect(composite).toBeVisible();
    const firstComposite = await composite.getAttribute('src');

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await nation.innerText()).toEqual(first);
    // The preview too: its seed is derived from the page's, not drawn after the roll.
    await expect(composite).toHaveAttribute('src', firstComposite ?? '');

    // And a different seed is a different nation, so the reproduction above is not the page
    // simply failing to re-roll.
    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await nation.innerText()).not.toEqual(first);
  });
});
