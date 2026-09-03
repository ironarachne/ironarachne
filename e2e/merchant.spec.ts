import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Requirement 7.4 for the `merchant` kind: generate, save, reopen, edit (#67).
 *
 * This is the half no unit test can settle. The library tests prove a merchant round-trips through
 * the codec and that each edit changes one thing; what they cannot prove is that a referee can
 * press Generate, keep the shop, come back to it in a different page, cross a line off the
 * inventory, and still have the shop they saved.
 *
 * The stock is what makes this tool different: it is a list a referee edits row by row, and the
 * editor's rows are the only place in the pass where adding and removing are the operations rather
 * than typing in a field.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

const MERCHANT_TITLE = 'Fantasy Merchant Generator | Iron Arachne';

const projectsPage = (page: Page) => page.locator('section.projects');
const vault = (page: Page) => page.locator('section.vault');
const inspector = (page: Page) => page.getByRole('region', { name: 'Inspector' });
const saveArtifact = (page: Page) => page.locator('.save-artifact');
const result = (page: Page) => page.locator('.merchant-result');

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
 * Keep whatever the tool has made, under a name of its own.
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

/**
 * Keep whatever the tool has made under the name the kind prefills.
 *
 * That prefill is the kind's own `nameOf`, which for a settlement is the town's name — and the
 * town's name is what a merchant referencing it reads, not whatever the vault entry is labelled.
 * Returns it so a caller can assert against the right string.
 */
async function saveUnderDefaultName(page: Page): Promise<string> {
  await saveArtifact(page).getByRole('button', { name: 'Save to project' }).click();
  const name = await saveArtifact(page).getByLabel('Name', { exact: true }).inputValue();
  expect(name).not.toBe('');
  await saveArtifact(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(saveArtifact(page).getByRole('status')).toContainText(`Saved “${name}”`);
  return name;
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

/** A pinned press, so the merchant on screen is the same one every run. */
async function generatePinned(page: Page, seed = 'a-fixed-seed'): Promise<void> {
  await page.getByLabel('Seed', { exact: true }).fill(seed);
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(result(page)).toBeVisible();
}

test.describe('a merchant', () => {
  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Market Road');
  });

  test('is generated, saved, reopened, and edited', async ({ page }) => {
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });

    // The generator rolls on mount (2.4), so there is a shop to keep straight away.
    await expect(result(page)).toBeVisible();
    await saveAs(page, 'The Copper Kettle');

    // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
    // rather than a state test.
    const panel = await openInWorkshop(page, 'The Copper Kettle');

    // Typed rather than filled: the point is that the editor's own binding carries keystrokes
    // through to the snapshot it announces.
    const advice = panel.getByRole('textbox', { name: 'Haggling advice' });
    await advice.fill('');
    await advice.pressSequentially('Will not budge a copper.');
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    // And it survived the round trip through IndexedDB, which is the whole claim.
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Copper Kettle');
    await expect(reopened.getByRole('textbox', { name: 'Haggling advice' })).toHaveValue(
      'Will not budge a copper.',
    );
  });

  test('lets a referee cross a line off the inventory and add another', async ({ page }) => {
    // The stock is a list a referee edits, which is why the rows carry their own controls. This is
    // requirement 4.4 as a user meets it.
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Salt Barrel');

    const panel = await openInWorkshop(page, 'The Salt Barrel');
    const rows = panel.locator('.merchant-editor__row');
    // Waited for rather than counted straight away: the editor is a dynamic import, so the panel is
    // visible a tick before its rows are, and `count()` does not retry.
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);

    const firstItem = await rows.first().getByRole('textbox', { name: 'Item' }).inputValue();
    await rows
      .first()
      .getByRole('button', { name: new RegExp(`^Remove ${firstItem}$`) })
      .click();
    await expect(rows).toHaveCount(before - 1);

    await panel.getByRole('button', { name: 'Add a stock row' }).click();
    await expect(rows).toHaveCount(before);
    await rows.last().getByRole('textbox', { name: 'Item' }).fill('a jar of pickled eggs');

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'The Salt Barrel');
    await expect(
      reopened.locator('.merchant-editor__row').last().getByRole('textbox', { name: 'Item' }),
    ).toHaveValue('a jar of pickled eggs');
  });

  test('offers the repricing rather than doing it under the user', async ({ page }) => {
    // Requirement 4.2, and the sharpest temptation in this library: every ask price is the catalog
    // cost times the modifier, so a form that re-derived the column would undo a marked-down price.
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });
    await generatePinned(page);
    await saveAs(page, 'The Bent Nail');

    const panel = await openInWorkshop(page, 'The Bent Nail');
    const firstRow = panel.locator('.merchant-editor__row').first();
    const askPrice = firstRow.getByRole('spinbutton', { name: 'Ask price (cp)' });
    await askPrice.fill('7');

    // Unmoved: changing the modifier the price is derived from did not touch it.
    await panel.getByRole('spinbutton', { name: 'Price modifier' }).fill('3');
    await expect(askPrice).toHaveValue('7');

    // And the arithmetic is there for the asking.
    await panel.getByRole('button', { name: 'Reprice the stock from the modifier' }).click();
    await expect(askPrice).not.toHaveValue('7');
  });

  test('downloads a shop a referee can take to the table', async ({ page }) => {
    // Requirement 6.3, and the first exports this tool has ever had. A shop inventory is exactly
    // the thing a referee wants on paper.
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });
    await generatePinned(page);
    const shopName = await result(page).locator('h2').innerText();

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(file.suggestedFilename()).toMatch(/^merchant-.*\.md$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents).toContain(`# ${shopName}`);
    expect(contents).toContain('## Proprietor');
    expect(contents).toContain('## Stock');
    expect(contents).toContain('| Item | Qty | Catalog | Ask price | Note |');

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    expect((await pdf).suggestedFilename()).toMatch(/^merchant-.*\.pdf$/);
  });

  test('reproduces the same merchant from the same seed', async ({ page }) => {
    // Requirement 2.2. The page reseeded its own RNG from the seed field inside an `$effect`, so
    // the next press depended on the text of the previous one.
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });

    await generatePinned(page, 'a-fixed-seed');
    const first = await result(page).innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await result(page).innerText()).not.toEqual(first);
  });

  test('generates its own inputs when there is nothing to compose with', async ({ page }) => {
    // Requirement 5.3. A project with no saved settlements has nothing to offer, so the picker
    // renders nothing at all and the shop invents its own corner of an unnamed town, exactly as it
    // did before.
    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });

    await expect(page.getByLabel('Put this shop in a saved settlement')).toHaveCount(0);
    await generatePinned(page);
    await expect(result(page).locator('.location')).not.toContainText(' In ');
  });

  test('puts the shop in a settlement the project already holds', async ({ page }) => {
    // Requirement 5.1: `settlement` is a registered kind, and where the shop stands is otherwise
    // invented. The offer appears only once there is something to offer.
    await visitRoute(page, '/fantasy/settlement', { title: 'Settlement Generator | Iron Arachne' });
    const town = await saveUnderDefaultName(page);

    await visitRoute(page, '/fantasy/merchant', { title: MERCHANT_TITLE });
    await page.getByLabel('Put this shop in a saved settlement').check();
    await page.getByLabel('Settlement', { exact: true }).selectOption({ label: town });
    await generatePinned(page);

    // The *town's* name, not the vault entry's: a settlement labelled "starting town" is still
    // called whatever the generator called it.
    await expect(result(page).locator('.location')).toContainText(`In ${town}.`);

    // And it travels with the artifact, which is what a reference is for.
    await saveAs(page, 'The Corner Stall');
    const panel = await openInWorkshop(page, 'The Corner Stall');
    await expect(panel.getByRole('textbox', { name: 'Settlement' })).toHaveValue(town);
  });
});
