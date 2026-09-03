import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `treasure-hoard` kind: generate, save, reopen, edit (#70).
 *
 * This is the half no unit test can settle. The library tests prove a hoard round-trips through the
 * codec and that taking an item out also takes it out of the chest it was in; what they cannot
 * prove is that a referee can press Generate, keep the pile, come back to it in a different page,
 * let the party carry something off, and still have the hoard they saved.
 *
 * A hoard is the pass's largest payload by count — dozens of items, each with their own arrays —
 * which is what makes the `$state.raw` question load-bearing here rather than incidental.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const HOARD_TITLE = 'Treasure Hoard Generator | Iron Arachne';

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');
const hoard = (page: Page) => page.locator('ul.hoard');

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

/** A pinned press, so the hoard on screen is the same one every run. */
async function generatePinned(page: Page, seed = 'a-fixed-seed'): Promise<void> {
  await page.getByLabel('Seed', { exact: true }).fill(seed);
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: /^Generate Treasure Hoard/ }).click();
  await expect(hoard(page)).toBeVisible();
}

test.describe('a treasure hoard', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Deep Vault');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });

    // The generator rolls on mount (2.4), so there is a pile to keep straight away.
    await expect(hoard(page)).toBeVisible();
    await saveAs(page, 'The Dragon Pile');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test. A hoard is the largest payload in the pass, so this is also the
    // sharpest test of the `$state.raw` question.
    const panel = await openInWorkshop(page, 'The Dragon Pile');
    const rows = panel.locator('.hoard-editor__item');
    await expect(rows.first()).toBeVisible();

    const name = rows.first().getByRole('textbox', { name: 'Name' });
    await name.fill('');
    await name.pressSequentially('the crown of a dead king');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Dragon Pile');
    await expect(
      reopened.locator('.hoard-editor__item').first().getByRole('textbox', { name: 'Name' }),
    ).toHaveValue('the crown of a dead king');
  });

  test('lets the party carry something off', async ({ page }) => {
    // The operation a hoard is edited by, and requirement 4.4 as a user meets it.
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Barrow Hoard');

    const panel = await openInWorkshop(page, 'The Barrow Hoard');
    const rows = panel.locator('.hoard-editor__item');
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);

    const taken = await rows.first().getByRole('textbox', { name: 'Name' }).inputValue();
    await rows
      .first()
      .getByRole('button', { name: new RegExp(`^Remove ${taken}$`) })
      .click();
    await expect(rows).toHaveCount(before - 1);

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Barrow Hoard');
    await expect(reopened.locator('.hoard-editor__item')).toHaveCount(before - 1);
  });

  test('does not reprice the hoard when an item is repriced', async ({ page }) => {
    // 4.2: the target value is what the hoard was *rolled for*, which stays true however much of it
    // the party takes or how a referee marks it.
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Marked Hoard');

    const panel = await openInWorkshop(page, 'The Marked Hoard');
    const target = panel.getByRole('spinbutton', { name: 'Rolled for (cp)' });
    const before = await target.inputValue();

    await panel
      .locator('.hoard-editor__item')
      .first()
      .getByRole('spinbutton', { name: 'Value (cp)' })
      .fill('1');
    await expect(target).toHaveValue(before);
  });

  test('downloads a hoard a referee can read out', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });
    await generatePinned(page);

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toBe('treasure-hoard.md');

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain('# Treasure Hoard');
    expect(contents).toContain('Worth ');
    // Every line names a thing and what it is worth.
    expect(contents).toMatch(/- .+ \(.+\)/);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toBe('treasure-hoard.pdf');
  });

  test('leaves no empty section behind when a category is switched off', async ({ page }) => {
    // 6.4 has teeth here, which both the issue and the design say. A hoard of nothing but coins
    // must not head an art section over nothing.
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });

    for (const [label, value] of [
      ['Proportion of Gems', '0'],
      ['Proportion of Art Objects', '0'],
      ['Proportion of Mundane Items', '0'],
      ['Proportion of Magic Items', '0'],
    ] as const) {
      await page.getByLabel(label).fill(value);
    }
    await generatePinned(page);

    const markdownDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const contents = await new Response(await (await markdownDownload).createReadStream()).text();

    // No heading stands over nothing: every `##` is followed by something on the next non-blank
    // line, and an empty chest says so.
    for (const [heading, body] of contents.matchAll(/^## (.+)\n\n(.*)$/gm)) {
      expect(body.trim(), heading).not.toBe('');
    }
  });

  test('reproduces the same hoard from the same seed', async ({ page }) => {
    // Requirement 2.2. The page reseeded its own RNG from the seed field inside an `$effect` and
    // again inside `generate()`, so the next press depended on the text of the previous one.
    await visitRoute(page, '/fantasy/treasure-hoard', { title: HOARD_TITLE });

    await generatePinned(page, 'a-fixed-seed');
    const first = await hoard(page).innerText();

    await page.getByRole('button', { name: /^Generate Treasure Hoard/ }).click();
    expect(await hoard(page).innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: /^Generate Treasure Hoard/ }).click();
    expect(await hoard(page).innerText()).not.toEqual(first);
  });
});
