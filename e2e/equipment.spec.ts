import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `item` kind: generate, save, reopen, edit (#66).
 *
 * This is the half no unit test can settle. The library tests prove an item round-trips through the
 * codec and that each edit changes one thing; what they cannot prove is that a user can press
 * Generate, keep *one* of the ten items on screen, come back to it in a different page, change what
 * it is made of, and still have the item they saved.
 *
 * The list is what makes this tool different from every other generator in the pass: one press
 * produces ten items and each card saves on its own, so the seed a card records has to be the one
 * that rolls *that* item.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const EQUIPMENT_TITLE = 'Equipment Generator | Iron Arachne';

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const cards = (page: Page) => page.locator('.item-card');

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
 * Keep one card's item, under a name of its own.
 *
 * Scoped to the card rather than the page: there are ten save buttons, which is the shape this
 * tool has and no other in the pass does.
 */
async function saveCard(page: Page, index: number, name: string): Promise<void> {
  const card = cards(page).nth(index);
  const saveArtifact = card.locator('.save-artifact');
  await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
  await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
  await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(saveArtifact.getByRole('status')).toContainText(`Saved “${name}”`);
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

/** A pinned press, so the items on screen are the same ones every run. */
async function generatePinned(page: Page, seed = 'a-fixed-seed'): Promise<void> {
  await page.getByLabel('Seed', { exact: true }).fill(seed);
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(cards(page).first()).toBeVisible();
}

test.describe('an item', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Armoury');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });

    // The generator rolls on mount (2.4), so there is a list to keep from straight away.
    await expect(cards(page)).toHaveCount(10);
    await saveCard(page, 2, 'The Third Sword');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Third Sword');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces.
    const unique = panel.getByRole('textbox', { name: 'Unique name' });
    await unique.fill('');
    await unique.pressSequentially('Bitterlight');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Third Sword');
    await expect(reopened.getByRole('textbox', { name: 'Unique name' })).toHaveValue('Bitterlight');
  });

  test('saves the card that was pressed, not the one beside it', async ({ page }) => {
    // A list of ten and one kind of artifact: the third card's save has to record the third item.
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    await generatePinned(page);

    const fourthHeading = await cards(page).nth(3).locator('h3').innerText();
    await saveCard(page, 3, 'The Fourth Thing');

    const panel = await openInWorkshop(page, 'The Fourth Thing');
    // The unique name is empty unless the generator drew one, so the item name is what identifies
    // it — and it is what the card's heading showed.
    const name = await panel.getByRole('textbox', { name: 'Item name' }).inputValue();
    const unique = await panel.getByRole('textbox', { name: 'Unique name' }).inputValue();
    expect([name, unique]).toContain(fourthHeading);
  });

  test('lets a user change what an item is made of, not just what it says', async ({ page }) => {
    // The requirement #66 states outright, and the reason the composition is stored rather than
    // only the rendered paragraph.
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    await generatePinned(page);
    await saveCard(page, 0, 'The First Thing');

    const panel = await openInWorkshop(page, 'The First Thing');
    const material = panel.getByRole('group', { name: 'Material' });
    await expect(material).toBeVisible();

    const materialName = material.getByRole('textbox', { name: 'Name' });
    await materialName.fill('meteoric iron');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The First Thing');
    await expect(
      reopened.getByRole('group', { name: 'Material' }).getByRole('textbox', { name: 'Name' }),
    ).toHaveValue('meteoric iron');
  });

  test('offers the description rather than rewriting it under the user', async ({ page }) => {
    // Requirement 4.2. The paragraph is composed from the parts, so a form that regenerated it on
    // every keystroke would throw away a hand-written one.
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    await generatePinned(page);
    await saveCard(page, 0, 'The Written Thing');

    const panel = await openInWorkshop(page, 'The Written Thing');
    const description = panel.getByRole('textbox', { name: 'Item description' });
    await description.fill('A judge wrote this by hand.');

    // Unmoved: changing a part the description is built from did not touch it.
    await panel
      .getByRole('group', { name: 'Material' })
      .getByRole('textbox', { name: 'Name' })
      .fill('bronze');
    await expect(description).toHaveValue('A judge wrote this by hand.');

    // And the generated wording is there for the asking.
    await panel.getByRole('button', { name: 'Rewrite the description from the parts' }).click();
    // `toHaveValue`, not `toContainText`: a textarea's edited value is not its text content.
    await expect(description).not.toHaveValue('A judge wrote this by hand.');
  });

  test('downloads the list and one item from it', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had.
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    await generatePinned(page);
    const firstHeading = await cards(page).first().locator('h3').innerText();

    const listDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown', exact: true }).click();
    const listFile = await listDownload;
    expect(listFile.suggestedFilename()).toBe('equipment.md');
    const list = await new Response(await listFile.createReadStream()).text();
    expect(list).toContain('# Equipment');
    expect(list).toContain(`## ${firstHeading}`);
    // The composition, named rather than only described — which storing the records is what buys.
    expect(list).toContain('- Material: ');

    const oneDownload = page.waitForEvent('download');
    await cards(page)
      .first()
      .getByRole('button', { name: `Download ${firstHeading} as Markdown` })
      .click();
    const oneFile = await oneDownload;
    expect(oneFile.suggestedFilename()).toMatch(/^item-.*\.md$/);
    expect(await new Response(await oneFile.createReadStream()).text()).toContain(
      `# ${firstHeading}`,
    );

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toBe('equipment.pdf');
  });

  test('reproduces the same list from the same seed', async ({ page }) => {
    // Requirement 2.2. The generator was already pure; the page reseeded its own RNG from the seed
    // field inside an `$effect`, so the next press depended on the text of the previous one.
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    const results = page.locator('.results');

    await generatePinned(page, 'a-fixed-seed');
    const first = await results.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await results.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await results.innerText()).not.toEqual(first);
  });

  test('names the composition on the card it used only to describe', async ({ page }) => {
    await visitRoute(page, '/fantasy/equipment-generator', { title: EQUIPMENT_TITLE });
    await generatePinned(page);

    const results = page.locator('.results');
    await expect(results).toContainText('Material:');
    await expect(results).toContainText('Value:');
    await expect(results).toContainText('Rarity:');
  });
});
