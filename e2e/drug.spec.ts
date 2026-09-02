import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `drug` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a drug round-trips through the
 * codec and that each field edit changes one thing; what they cannot prove is that a referee can
 * press Generate, keep the result, come back to it in a different page, change something, and still
 * have the drug they saved. Every step of that crosses a boundary the unit tests stub out — the
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

const DRUG_TITLE = 'Cyberpunk Drug Generator | Iron Arachne';

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

test.describe('a drug', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'Night Market');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/drug', { title: DRUG_TITLE });

    // The generator rolls on mount (2.4), so there is a drug to keep straight away.
    await expect(page.locator('.drug')).toBeVisible();
    await saveAs(page, 'Blue Jack');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'Blue Jack');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const colour = panel.getByRole('textbox', { name: 'Colour' });
    await colour.fill('');
    await colour.pressSequentially('matte black');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Blue Jack');
    await expect(reopened.getByRole('textbox', { name: 'Colour' })).toHaveValue('matte black');
  });

  test('offers the description rather than rewriting it under the user', async ({ page }) => {
    // Requirement 4.2. The description is built from the other ten fields, so a form that
    // regenerated it on every keystroke would throw away a hand-written one.
    await visitRoute(page, '/drug', { title: DRUG_TITLE });
    await saveAs(page, 'Star Wonder');

    const panel = await openInWorkshop(page, 'Star Wonder');
    const description = panel.getByRole('textbox', { name: 'Drug description' });
    await description.fill('A judge wrote this by hand.');

    // Unmoved: changing a field the description is built from did not touch it.
    await panel.getByRole('textbox', { name: 'Strength' }).fill('catastrophically potent');
    await expect(description).toHaveValue('A judge wrote this by hand.');

    // And the generated wording is there for the asking.
    await panel.getByRole('button', { name: 'Rewrite the description from the fields' }).click();
    // `toHaveValue`, not `toContainText`: a textarea's edited value is not its text content.
    await expect(description).toHaveValue(/catastrophically potent/);
  });

  test('downloads a drug a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/drug', { title: DRUG_TITLE });
    const heading = await page.locator('.drug h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain(`# ${heading}`);
    expect(contents).toContain('- Form: ');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('shows the fields it used to hide behind the description', async ({ page }) => {
    // The page rendered `drug.description` alone, so the ten fields behind it were invisible and
    // the editor had fields answering to nothing on screen.
    await visitRoute(page, '/drug', { title: DRUG_TITLE });
    const drug = page.locator('.drug');
    for (const label of ['Form', 'Taken', 'Effect', 'Strength', 'Colour', 'Duration']) {
      await expect(drug.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('reproduces the same drug from the same seed', async ({ page }) => {
    // Requirement 2.2: the seed control worked and the seed itself came from the clock.
    await visitRoute(page, '/drug', { title: DRUG_TITLE });
    const drug = page.locator('.drug');

    await page.getByLabel('Random Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await drug.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await drug.innerText()).toEqual(first);

    await page.getByLabel('Random Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await drug.innerText()).not.toEqual(first);
  });
});
