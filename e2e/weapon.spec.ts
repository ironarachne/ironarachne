import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the magic weapon generator (#69).
 *
 * It shares the kind `item` with `/fantasy/equipment-generator` — decision 1 of
 * docs/readiness-objects.md — so the editor, the snapshot and the presentation are all #66's. What
 * is this tool's own is the roll: a theme drawn from a religious domain, a range category, and a
 * provenance the registry has to tell apart from the equipment generator's by tool path.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const WEAPON_TITLE = 'Magic Weapon Generator | Iron Arachne';

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');
const result = (page: Page) => page.locator('.weapon-result');

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

/** A pinned press, so the weapon on screen is the same one every run. */
async function generatePinned(page: Page, seed = 'a-fixed-seed'): Promise<void> {
  await page.getByLabel('Seed', { exact: true }).fill(seed);
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(result(page)).toBeVisible();
}

test.describe('a magic weapon', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Reliquary');
  });

  test('generates on every category, which two of three used to crash on', async ({ page }) => {
    // The bug this issue did not know it had: "melee" and "ranged" were passed through
    // `itemMinorType`, matched no weapon type at all, and generation threw
    // `Cannot read properties of undefined`.
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });

    for (const category of ['melee', 'ranged', 'any']) {
      await page.getByLabel('Category').selectOption(category);
      await page.getByRole('button', { name: 'Generate', exact: true }).click();
      await expect(result(page).locator('h2'), category).not.toBeEmpty();
    }
  });

  test('shows what it rolled, not just a name and a sentence', async ({ page }) => {
    // The page rendered a heading and one paragraph, with the damage, the value, the weight, the
    // material and the enchantment it had just rolled all invisible.
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });
    await generatePinned(page);

    // A stat is a `<dt>`/`<dd>` pair, so the key carries no colon of its own.
    for (const label of ['Damage', 'Value', 'Material', 'Enchantment']) {
      await expect(result(page).getByText(label, { exact: true }), label).toBeVisible();
    }
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });

    // The generator rolls on mount (2.4), so there is a weapon to keep straight away.
    await expect(result(page)).toBeVisible();
    await saveAs(page, 'The Consecrated Blade');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test. The editor is #66's, shared through the kind.
    const panel = await openInWorkshop(page, 'The Consecrated Blade');
    const unique = panel.getByRole('textbox', { name: 'Unique name' });
    await unique.fill('');
    await unique.pressSequentially('Vowbreaker');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Consecrated Blade');
    await expect(reopened.getByRole('textbox', { name: 'Unique name' })).toHaveValue('Vowbreaker');
  });

  test('reproduces the same weapon from the same seed, theme included', async ({ page }) => {
    // Requirement 2.2, twice over: the page reseeded its own RNG from the seed field, and it drew
    // the theme from that same stream when the control read "any" — so the roll depended on
    // something the provenance did not record.
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });

    await generatePinned(page, 'a-fixed-seed');
    const first = await result(page).innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).not.toEqual(first);
  });

  test('downloads a weapon a player can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });
    await generatePinned(page);
    const name = await result(page).locator('h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toMatch(/^item-.*\.md$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain(`# ${name}`);
    expect(contents).toContain('- Damage: ');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/^item-.*\.pdf$/);
  });

  test('generates its own theme when there is nothing to consecrate to', async ({ page }) => {
    // Requirement 5.3. A project with no saved religions has nothing to offer, so the picker
    // renders nothing at all and the weapon themes on any of the fifty-eight domains.
    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });

    await expect(page.getByLabel('Consecrate this weapon to a saved religion')).toHaveCount(0);
    await generatePinned(page);
    await expect(result(page).getByText('Enchantment', { exact: true })).toBeVisible();
  });

  test('narrows the themes to a referenced religion', async ({ page }) => {
    // Requirement 5.1: a weapon consecrated to a domain no god in that religion holds is not a
    // weapon of that religion, so the list narrows rather than merely being annotated.
    await visitRoute(page, '/fantasy/religion', { title: 'Religion Generator | Iron Arachne' });
    await saveAs(page, 'The Ashen Covenant');

    await visitRoute(page, '/fantasy/weapon', { title: WEAPON_TITLE });
    const themes = page.getByLabel('Theme');
    const before = await themes.locator('option').count();

    await page.getByLabel('Consecrate this weapon to a saved religion').check();
    await page.getByLabel('Religion', { exact: true }).selectOption({ index: 1 });
    await expect.poll(async () => themes.locator('option').count()).toBeLessThan(before);

    await generatePinned(page);
    await saveAs(page, 'The Covenant Blade');

    // The reference travels with the artifact, which is what a reference is for.
    await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
    await vaultRow(page, 'The Covenant Blade').click();
    // The inspector humanises a reference's role, so the raw `consecrated-to` is not what shows.
    await expect(inspector(page)).toContainText('Consecrated to');
  });
});
