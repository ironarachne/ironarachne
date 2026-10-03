import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';
import { expectNoHorizontalOverflow } from './mobile_layout';

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
  const panel = page
    .getByRole('region', { name: `${name} panel`, exact: true })
    .locator('.artifact-panel');
  await expect(panel).toBeVisible({ timeout: 30_000 });
  return panel;
}

async function openGenerator(page: Page): Promise<void> {
  await visitRoute(page, '/region', { title: REGION_TITLE });
  await expect(page.locator('img.region-map')).toBeVisible({ timeout: 30_000 });
}

test('saved regional materials survive editing and use current source evidence', async ({
  page,
}) => {
  test.slow();
  await openEmpty(page);
  await createProject(page, 'Material campaign');
  await openGenerator(page);
  await page.getByLabel('Seed', { exact: true }).fill('alpha');
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await saveAs(page, 'Material region');
  await page.goto('/fantasy/settlement/');
  await page.getByLabel('Choose materials from a saved region?').check();
  await page.getByLabel('Material source region').selectOption({ label: 'Material region' });
  await page
    .getByLabel('Source settlement', { exact: true })
    .selectOption(JSON.stringify({ kind: 'embedded', settlementId: 'settlement:1' }));
  const details = page.getByRole('region', { name: 'Regional material details' });
  await expect(details.locator('li')).not.toHaveCount(0);
  const materials = await details.locator('li').allTextContents();
  await expect(details).toContainText('do not establish supply at this settlement');
  await saveAs(page, 'Material consumer');
  await page.reload();
  let panel = await openInWorkshop(page, 'Material consumer');
  await expect(
    panel.getByRole('region', { name: 'Regional material details' }).locator('li'),
  ).toHaveText(materials);
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download Markdown' }).click();
  const markdown = await new Response(await (await download).createReadStream()).text();
  for (const material of materials) expect(markdown).toContain(material);
  const pdf = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download PDF' }).click();
  expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  await page.setViewportSize({ width: 320, height: 740 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  panel = await openInWorkshop(page, 'Material region');
  await panel
    .getByRole('textbox', { name: 'Settlement 1 name', exact: true })
    .fill('Renamed material source');
  await panel.getByRole('button', { name: 'Save changes' }).click();
  await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  const liveConsumer = page.getByRole('region', { name: 'Material consumer panel', exact: true });
  await expect(
    liveConsumer.getByRole('region', { name: 'Regional material details' }),
  ).toContainText('Renamed material source');
  panel = await openInWorkshop(page, 'Material consumer');
  const revised = panel.getByRole('region', { name: 'Regional material details' });
  await expect(revised).toContainText('Renamed material source');
  await expect(revised).toContainText('needs review');
  await expect(revised.locator('li')).toHaveCount(0);
  await visitRoute(page, '/vault', { title: 'Result Vault | Iron Arachne' });
  await vaultRow(page, 'Material region').click();
  await inspector(page).getByRole('button', { name: 'Delete', exact: true }).click();
  await page.locator('dialog.panel').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(vaultRow(page, 'Material region')).toHaveCount(0);
  panel = await openInWorkshop(page, 'Material consumer');
  await expect(panel.getByRole('region', { name: 'Regional material details' })).toContainText(
    'unavailable',
  );
  await expect(panel.getByRole('button', { name: 'Clear material context' })).toBeVisible();
  await expect(panel.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'Material consumer',
  );
  await panel.getByRole('button', { name: 'Clear material context' }).click();
  await panel.getByRole('button', { name: 'Save changes' }).click();
  await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await page.reload();
  panel = await openInWorkshop(page, 'Material consumer');
  await expect(panel.getByRole('region', { name: 'Regional material details' })).toHaveCount(0);
});

test('a settlement tool clears regional composition when its project changes', async ({ page }) => {
  test.slow();
  await openEmpty(page);
  await createProject(page, 'Source campaign');
  await openGenerator(page);
  await page.getByLabel('Seed', { exact: true }).fill('alpha');
  await page.getByLabel('Lock Seed').check();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await saveAs(page, 'Source region');
  await createProject(page, 'Empty campaign');
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
  const switcher = page.locator('section.project-context').getByLabel('Open project');
  await switcher.selectOption({ label: 'Source campaign' });
  await page
    .locator('section.tool-browser')
    .getByRole('button', { name: /^Settlement$/ })
    .click();
  const tool = page.getByRole('region', { name: 'Settlement panel', exact: true });
  await tool.getByLabel('Choose materials from a saved region?').check();
  await tool.getByLabel('Material source region').selectOption({ label: 'Source region' });
  const sources = tool.getByLabel('Source settlement', { exact: true });
  await sources.selectOption(JSON.stringify({ kind: 'embedded', settlementId: 'settlement:1' }));
  await expect(
    tool.getByRole('region', { name: 'Regional material details' }).locator('li'),
  ).not.toHaveCount(0);
  const options = await sources.locator('option').all();
  const lastName = await options.at(-1)!.innerText();
  await sources.selectOption({ index: 1 });
  await sources.selectOption({ index: options.length - 1 });
  await expect(
    tool.getByRole('region', { name: 'Regional material details' }).getByRole('heading'),
  ).toContainText(lastName);
  await switcher.selectOption({ label: 'Empty campaign' });
  await expect(tool.getByRole('region', { name: 'Regional material details' })).toHaveCount(0);
  await expect(tool.getByRole('button', { name: 'Clear material context' })).toHaveCount(0);
  await expect(tool.getByLabel('Choose materials from a saved region?')).toHaveCount(0);
  await switcher.selectOption({ label: 'Source campaign' });
  await expect(tool.getByLabel('Choose materials from a saved region?')).not.toBeChecked();
  await expect(tool.getByRole('region', { name: 'Regional material details' })).toHaveCount(0);
});
