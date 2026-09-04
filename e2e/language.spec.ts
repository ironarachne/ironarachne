import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `language` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a language round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a user
 * can press Generate, keep the result, come back to it in a different page, change something, and
 * still have the language they saved. Every step of that crosses a boundary the unit tests stub out
 * — the artifact store, IndexedDB, the editor registry, and a page reload.
 *
 * It matters more here than for most kinds, because this is the largest payload the site stores:
 * 1,760 words and about 144 KB of JSON per language. A round trip that works on a settlement is not
 * evidence that one works on this.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');

const LANGUAGE_TITLE = 'Language Generator | Iron Arachne';

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

test.describe('a constructed language', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Sundered Coast');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/language', { title: LANGUAGE_TITLE });

    // The generator rolls on mount (2.4), so there is a language to keep straight away.
    await expect(page.getByText('Word order', { exact: true })).toBeVisible();
    await saveAs(page, 'Kethric');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test — and what proves a 144 KB payload survives the round trip.
    const panel = await openInWorkshop(page, 'Kethric');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces. The value is one no roll produces.
    const orthography = panel.getByRole('textbox', { name: 'Orthography' });
    await orthography.fill('');
    await orthography.pressSequentially('Written in a borrowed abjad.');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Kethric');
    await expect(reopened.getByRole('textbox', { name: 'Orthography' })).toHaveValue(
      'Written in a borrowed abjad.',
    );
  });

  test('is edited one word at a time, through the search box', async ({ page }) => {
    // Requirement 4.4 on the half that makes this editor bespoke. A lexicon of 1,760 words is not
    // a form: the search box is the only way through it, and each row has to carry its index into
    // the *unfiltered* lexicon so that typing in the search box cannot rewrite the wrong word.
    await visitRoute(page, '/language', { title: LANGUAGE_TITLE });
    await saveAs(page, 'Velmish');

    const panel = await openInWorkshop(page, 'Velmish');
    const count = panel.getByRole('status');
    await expect(count).toContainText('words');

    await panel.getByRole('searchbox', { name: 'Search the lexicon' }).fill('stone');
    await expect(count).not.toContainText(/^1,?7\d\d of/);

    // The first match, rewritten and saved, then found again after a reload under its new form.
    const form = panel.getByRole('textbox', { name: /Word \d+ form/ }).first();
    await form.fill('zzyzx');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Velmish');
    await reopened.getByRole('searchbox', { name: 'Search the lexicon' }).fill('zzyzx');
    await expect(reopened.getByRole('textbox', { name: /Word \d+ form/ }).first()).toHaveValue(
      'zzyzx',
    );
  });

  test('downloads the glossary a conlanger can keep', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had — which the issue calls a real
    // loss, a conlang being a document.
    await visitRoute(page, '/language', { title: LANGUAGE_TITLE });

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents).toContain('## Typology');
    expect(contents).toContain('## Nouns');
    // 6.4: no heading with nothing under it.
    expect(contents).not.toMatch(/## [^\n]+\n\n(##|$)/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('reproduces the same language from the same seed', async ({ page }) => {
    // Requirement 2.3, which is what actually failed here rather than 2.2: the page rendered no
    // seed control at all and drew a fresh seed from `Date.now()` on every press, so a language a
    // user liked could not be got back — there was nothing to write down.
    await visitRoute(page, '/language', { title: LANGUAGE_TITLE });
    const heading = page.getByRole('heading', { level: 2 });

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const first = await heading.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).not.toEqual(first);
  });
});
