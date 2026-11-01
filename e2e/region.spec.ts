import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';
import { expectNoHorizontalOverflow } from './mobile_layout';
import { REGION_SEED_BANK } from '../test_fixtures/region_seeds';

/**
 * Requirement 7.4 for the `region` kind: generate, save, reopen, edit.
 *
 * This is the half no unit test can settle. The library tests prove a region round-trips through
 * the codec and that each editing function changes one field; what they cannot prove is that a
 * referee can press Generate, keep the result, come back to it in a different page, change
 * something, and still have the region they saved. Every step of that crosses a boundary the unit
 * tests stub out — the artifact store, IndexedDB, the editor registry, and a page reload. A region
 * is the most composed payload on the site, so it is also the heaviest thing the store carries.
 *
 * Accessibility (6.2) is asserted here rather than in a separate spec because the only honest test
 * of "operable by keyboard, with meaningful accessible names" is reaching the controls by those
 * names, which is what these tests do throughout.
 */

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
  const panel = page.locator('.artifact-panel');
  await expect(panel).toBeVisible({ timeout: 30_000 });
  return panel;
}

async function openGenerator(page: Page): Promise<void> {
  await visitRoute(page, '/region', { title: REGION_TITLE });
  await expect(page.locator('img.region-map')).toBeVisible({ timeout: 30_000 });
}

test.describe('a region', () => {
  // A region composes a culture, a map, settlements, organizations and four kinds of character, so
  // both rolling one and storing one take longer than anything else in this suite.
  test.slow();

  test.beforeEach(async ({ page }) => {
    await openEmpty(page);
    await createProject(page, 'The Marches');
  });

  test('keeps organization contacts and saved prose through export and reopening', async ({
    page,
  }, testInfo) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const organizations = page
      .locator('.gazetteer')
      .getByRole('region', { name: 'Organizations', exact: true });
    await expect(organizations).toBeVisible();
    const words = await organizations.locator('[data-gazetteer-text]').allTextContents();
    expect(await organizations.locator('article').count()).toBeGreaterThan(0);
    for (const article of await organizations.locator('article').all()) {
      await expect(article.locator('h4')).toHaveCount(1);
      await expect(article).toContainText('Leader:');
      await expect(article).toContainText(/members?/);
      await expect(article).not.toContainText(
        /Their most telling liability|Public standing:|crown shade/,
      );
    }
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdown = await new Response(await (await download).createReadStream()).text();
    for (const paragraph of words) expect(markdown).toContain(paragraph);
    await page.setViewportSize({ width: 375, height: 812 });
    await expectNoHorizontalOverflow(page);
    await organizations.screenshot({
      path: testInfo.outputPath('organization-reading.png'),
      animations: 'disabled',
    });
    await page.locator('details.inspection > summary').click();
    await expect(page.locator('details.inspection')).toContainText(
      'Organization contacts and supported profiles',
    );
    await saveAs(page, 'Organization Reading');
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Organization Reading');
    const saved = reopened
      .locator('.gazetteer')
      .getByRole('region', { name: 'Organizations', exact: true });
    await expect(saved).toBeVisible();
    expect(await saved.locator('[data-gazetteer-text]').allTextContents()).toEqual(words);
  });

  test('keeps settlement portraits and conditional work separate through display and export', async ({
    page,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('449-opportunity');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const settlements = page
      .locator('.gazetteer')
      .getByRole('region', { name: 'Settlements', exact: true });
    await expect(
      settlements.getByRole('heading', { name: 'Possible work', exact: true }).first(),
    ).toBeVisible();
    const work = await settlements
      .locator('h5')
      .evaluateAll((headings) =>
        headings
          .filter((heading) => heading.textContent === 'Possible work')
          .map((heading) => heading.nextElementSibling!.textContent!),
      );
    expect(work.length).toBeGreaterThan(0);
    for (const article of await settlements.locator('article').all()) {
      await expect(article.locator('h4')).toHaveCount(1);
      await expect(article).toContainText(/population \d/);
    }
    const words = await settlements.locator('[data-gazetteer-text]').allTextContents();
    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const text = await new Response(await (await markdown).createReadStream()).text();
    for (const paragraph of words) expect(text).toContain(paragraph);
    expect(text).toContain('#### Possible work');
    expect(text).not.toMatch(/drying.*using drying|stone dressing.*using stone dressing/);
    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    await (await pdf).saveAs(testInfo.outputPath('settlement-reading.pdf'));
    await page.setViewportSize({ width: 375, height: 812 });
    await expectNoHorizontalOverflow(page);
    await settlements
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: 'Possible work', exact: true }) })
      .first()
      .screenshot({ path: testInfo.outputPath('settlement-reading.png') });
    await saveAs(page, 'Settlement Reading');
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Settlement Reading');
    await expect(reopened.locator('.gazetteer')).toBeVisible();
    expect(
      await reopened
        .locator('.gazetteer')
        .getByRole('region', { name: 'Settlements', exact: true })
        .locator('[data-gazetteer-text]')
        .allTextContents(),
    ).toEqual(words);
    const evidence = reopened.locator('details.inspection');
    await evidence.locator('summary').first().click();
    await expect(evidence).toContainText('Settlement portraits and possible work');
    expect(pageErrors).toEqual([]);
  });

  test('keeps the compact road directory through saving, reopening and exports', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const routes = page.locator('.gazetteer article[data-fact-id^="route:road:"]');
    expect(await routes.count()).toBeGreaterThan(0);
    const identities = await routes.evaluateAll((entries) =>
      entries.map((entry) => ({
        id: entry.getAttribute('data-fact-id'),
        anchor: entry.id.split('-route-').at(-1),
        heading: entry.querySelector('h4')!.textContent,
      })),
    );
    for (const route of await routes.all()) {
      await expect(route.locator('h4')).toContainText(' to ');
      await expect(route).not.toContainText('Hook:');
      await expect(route.getByRole('link', { name: 'Inspect facts' })).toBeVisible();
    }
    const prose = await routes.locator('[data-gazetteer-text]').allTextContents();
    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const contents = await new Response(await (await markdown).createReadStream()).text();
    for (const identity of identities) expect(contents).toContain(identity.heading);
    for (const sentence of prose) expect(contents).toContain(sentence);
    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    const pdfContents = new TextDecoder('latin1').decode(
      await new Response(await (await pdf).createReadStream()).arrayBuffer(),
    );
    expect(pdfContents.startsWith('%PDF')).toBe(true);
    for (const identity of identities) {
      // PDF literal strings escape parentheses and backslashes; short endpoint names do not wrap.
      const endpoint = identity.heading!.split(' to ')[0].replace(/[()\\]/g, '\\$&');
      expect(pdfContents).toContain(endpoint);
    }
    await saveAs(page, 'Road Country');
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Road Country');
    for (const identity of identities) {
      const route = reopened
        .locator('.gazetteer article')
        .filter({ has: page.getByRole('heading', { name: identity.heading!, exact: true }) });
      await expect(route).toHaveAttribute('data-fact-id', identity.id!);
      expect((await route.getAttribute('id'))!.split('-route-').at(-1)).toBe(identity.anchor);
    }
    for (const sentence of prose)
      await expect(reopened.locator('.gazetteer')).toContainText(sentence);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps grounded suggestions through saving and preserves an authored replacement', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('bravo');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const gazetteer = page.locator('.gazetteer');
    const place = gazetteer
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: 'Suggested adventure', exact: true }) })
      .first();
    await expect(place).toBeVisible();
    const notableId = await place.getAttribute('data-notable-id');
    expect(notableId).toBeTruthy();
    const prompt = await place.locator('[data-gazetteer-text]').last().textContent();
    await expect(place).toContainText('Location:');
    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await markdown;
    expect(await new Response(await file.createReadStream()).text()).toContain(prompt);
    await saveAs(page, 'Grounded Suggestions');
    const panel = await openInWorkshop(page, 'Grounded Suggestions');
    await expect(panel.locator('.gazetteer')).toContainText(prompt!);
    await panel
      .locator(`textarea[id$="${notableId}-description"]`)
      .fill('My adventure place. Hook: Keep this authored choice.');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Grounded Suggestions');
    await expect(reopened.locator('.gazetteer')).toContainText('My adventure place.');
    await expect(reopened.locator('.gazetteer')).toContainText('Keep this authored choice.');
    await expect(
      reopened
        .locator('.gazetteer')
        .getByRole('heading', { name: 'Authored adventure', exact: true }),
    ).toBeVisible();
    await expect(reopened.locator('.gazetteer')).not.toContainText(prompt!);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps declared activities and description evidence through editing and reopening', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const evidence = page.locator('details.inspection');
    await evidence.locator(':scope > summary').click();
    await expect(evidence).toContainText('description evidence');
    await expect(evidence).toContainText('activityKey');
    await saveAs(page, 'Declared Work');
    const panel = await openInWorkshop(page, 'Declared Work');
    const description = panel.getByLabel('Activity 1 description', { exact: true });
    await expect(description).toBeVisible();
    await description.fill('The household craft tradition described by the referee.');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Declared Work');
    await expect(reopened.getByLabel('Activity 1 description', { exact: true })).toHaveValue(
      'The household craft tradition described by the referee.',
    );
    const removeButtons = reopened.getByRole('button', {
      name: /Remove settlement \d+ from this region/,
    });
    expect(
      await removeButtons.evaluateAll((buttons) =>
        buttons.some((button) => (button as HTMLButtonElement).disabled),
      ),
    ).toBe(true);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps qualified raw source evidence through editing, saving and reopening', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('bravo');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'Qualified Sources');
    const panel = await openInWorkshop(page, 'Qualified Sources');
    const source = panel.getByRole('group', { name: 'Raw source 1', exact: true });
    await expect(source).toBeVisible();
    const evidence = panel.locator('details.inspection');
    await evidence.locator(':scope > summary').click();
    await expect(evidence).toContainText('Acquisition requires');
    await expect(evidence).toContainText('definitionId');
    await source
      .getByRole('textbox', { name: 'Raw source 1 name', exact: true })
      .fill('The referee’s named source');
    await source
      .getByRole('textbox', { name: 'Raw source 1 description', exact: true })
      .fill('An authored source account.');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Qualified Sources');
    await expect(reopened.getByLabel('Raw source 1 name', { exact: true })).toHaveValue(
      'The referee’s named source',
    );
    await expect(reopened.getByLabel('Raw source 1 description', { exact: true })).toHaveValue(
      'An authored source account.',
    );
    await expectNoHorizontalOverflow(page);
  });

  test('keeps a named mountain range through saving, editing, and reopening', async ({ page }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('mountain-range-9');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('img.region-map')).toHaveAttribute('src', /data-range-id/);
    await saveAs(page, 'Mountain Country');
    const panel = await openInWorkshop(page, 'Mountain Country');
    const originalMap = await panel.locator('img.region-map').getAttribute('src');
    await expect(panel.getByLabel('Mountain range 1 name', { exact: true })).toBeVisible();
    await panel.getByLabel('Mountain range 1 name', { exact: true }).fill('The Copper Range');
    await panel
      .getByLabel('Mountain range 1 description', { exact: true })
      .fill('A mountain ridge named by the referee.');
    await expect(panel.locator('img.region-map')).toHaveAttribute('src', /The%20Copper%20Range/);
    const editedMap = await panel.locator('img.region-map').getAttribute('src');
    expect(editedMap).not.toBe(originalMap);
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Mountain Country');
    await expect(reopened.getByLabel('Mountain range 1 name', { exact: true })).toHaveValue(
      'The Copper Range',
    );
    await expect(reopened.getByLabel('Mountain range 1 description', { exact: true })).toHaveValue(
      'A mountain ridge named by the referee.',
    );
    await expect(reopened.locator('img.region-map')).toHaveAttribute('src', editedMap!);
    await reopened
      .getByRole('button', { name: 'Remove mountain range 1 from this region' })
      .click();
    await expect(reopened.getByLabel('Mountain range 1 name', { exact: true })).toHaveCount(0);
    await expect(reopened.locator('img.region-map')).not.toHaveAttribute('src', /data-range-id/);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps grounded identity prose through export, saving, and reopening', async ({ page }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('alpha');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const identity = page.locator('.gazetteer');
    await expect(identity).toBeVisible();
    const details = await identity.locator(':scope > p[data-gazetteer-text]').allTextContents();
    expect(details.length).toBeGreaterThan(0);
    expect(details.length).toBeLessThanOrEqual(3);
    expect(await identity.textContent()).not.toContain('undefined');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const contents = await new Response(await (await download).createReadStream()).text();
    for (const detail of details) expect(contents).toContain(detail);
    await saveAs(page, 'Identity Country');
    const panel = await openInWorkshop(page, 'Identity Country');
    const saved = panel.locator('.gazetteer');
    for (const detail of details) await expect(saved).toContainText(detail);
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Identity Country');
    for (const detail of details)
      await expect(reopened.locator('.gazetteer')).toContainText(detail);
    await expectNoHorizontalOverflow(page);
  });

  test('uses fluent regional prose and excludes unnamed forest identities for the reported seed', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByLabel('Affiliation', { exact: true }).selectOption('random');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const introduction = page.locator('.gazetteer > p').first();
    await expect(introduction).toContainText('open grassland', { ignoreCase: true });
    await expect(introduction).toContainText('rain-soaked woodland');
    await expect(introduction).not.toContainText('Dense forest');
    await expect(introduction).not.toContainText('lie alongside');
    await expect(introduction).not.toContainText('in a mild climate');
    await expect(introduction).toContainText(/meet along a river|A river runs between patches/);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps dense forest artwork through text edits, saving, and reopening', async ({ page }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('alpha');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('img.region-map')).toHaveAttribute('src', /data-dense-forest-id/);
    await saveAs(page, 'Forest Country');
    const panel = await openInWorkshop(page, 'Forest Country');
    await panel.getByLabel('Dense forest 1 name', { exact: true }).fill('The Copper Wood');
    await panel
      .getByLabel('Dense forest 1 description', { exact: true })
      .fill('A dense canopy named by the referee.');
    await expect(panel.locator('img.region-map')).toHaveAttribute('src', /data-dense-forest-id/);
    await expect(panel).toContainText('These saved facts need review');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Forest Country');
    await expect(reopened.getByLabel('Dense forest 1 name', { exact: true })).toHaveValue(
      'The Copper Wood',
    );
    await expect(reopened.getByLabel('Dense forest 1 description', { exact: true })).toHaveValue(
      'A dense canopy named by the referee.',
    );
    await expect(reopened.locator('img.region-map')).toHaveAttribute('src', /data-dense-forest-id/);
    await expectNoHorizontalOverflow(page);
  });

  test('saves and reopens an unaffiliated region with optional political neighbors', async ({
    page,
  }) => {
    await openGenerator(page);
    await expect(page.getByLabel('Affiliation', { exact: true })).toHaveValue('random');
    await expect(page.getByLabel('Generate neighboring realms')).not.toBeChecked();
    await page.getByLabel('Affiliation', { exact: true }).selectOption('unaffiliated');
    await page.getByLabel('Seed', { exact: true }).fill('unaffiliated-browser');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.getByText('Affiliation: Unaffiliated', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Ruler:/ })).toHaveCount(0);
    const before = await page.locator('img.region-map').getAttribute('src');
    await page.getByLabel('Generate neighboring realms').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('img.region-map')).toHaveAttribute('src', before!);
    await saveAs(page, 'Free Country');
    const panel = await openInWorkshop(page, 'Free Country');
    await expect(panel.getByText('Affiliation: Unaffiliated', { exact: true })).toBeVisible();
    await expect(panel.getByLabel('Seat of the region')).toHaveCount(0);
    await expect(panel.getByRole('textbox', { name: 'Realm 1 name', exact: true })).toBeVisible();
    await panel.getByRole('textbox', { name: 'Region name', exact: true }).fill('The Free Reaches');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Free Country');
    await expect(reopened.getByRole('textbox', { name: 'Region name', exact: true })).toHaveValue(
      'The Free Reaches',
    );
    await expect(reopened.getByLabel('Seat of the region')).toHaveCount(0);
    await reopened.getByRole('button', { name: 'Roll again', exact: true }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Roll again', exact: true })
      .click();
    await expect(
      reopened.getByRole('textbox', { name: 'Region name', exact: true }),
    ).not.toHaveValue('The Free Reaches');
    await expect(reopened.getByText('Affiliation: Unaffiliated', { exact: true })).toBeVisible();
    await expect(
      reopened.getByRole('textbox', { name: 'Realm 1 name', exact: true }),
    ).toBeVisible();
  });

  for (const { seed, contrast } of REGION_SEED_BANK) {
    test(`is generated, saved, reopened, and edited: ${contrast}`, async ({ page }) => {
      await openGenerator(page);
      await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
      await page.getByLabel('Seed', { exact: true }).fill(seed);
      await page.getByLabel('Lock Seed').check();
      await page.getByRole('button', { name: 'Generate', exact: true }).click();

      // Save the pinned fixture produced through the page's seed controls.
      await saveAs(page, 'The Cold Marches');

      const notableIds = await page
        .locator('[data-notable-id]')
        .evaluateAll((places) => places.map((place) => place.getAttribute('data-notable-id')));

      // Reopened somewhere else entirely, after a reload, which is what makes this a durability test
      // rather than a state test.
      const panel = await openInWorkshop(page, 'The Cold Marches');
      await expect(panel.locator('[data-notable-id]')).toHaveCount(notableIds.length);
      expect(
        await panel
          .locator('[data-notable-id]')
          .evaluateAll((places) => places.map((place) => place.getAttribute('data-notable-id'))),
      ).toEqual(notableIds);

      // Keep a real keystroke to verify the binding. Filling the prefix avoids eight full
      // gazetteer redraws on the larger fixtures; this checks durability, not typing throughput.
      const realmName = panel.getByRole('textbox', { name: 'Realm 1 name', exact: true });
      await realmName.fill('Ashmarc');
      await realmName.press('End');
      await realmName.pressSequentially('h');
      const description = panel.getByRole('textbox', { name: 'Region description' });
      await description.fill('An authored gazetteer entry.');
      const ecologyField = panel.getByRole('textbox', { name: 'Flora and fauna description' });
      const hasEcology = (await ecologyField.count()) > 0;
      if (seed === 'bravo') await expect(ecologyField).toHaveCount(1);
      if (hasEcology) await ecologyField.fill('Marsh reeds sustain local weaving.');
      await panel
        .getByRole('textbox', { name: 'Settlement 1 name', exact: true })
        .fill('Reviewtown');
      await expect(panel).toContainText('These saved facts need review');
      await expect(panel).toContainText('Only whole-region reroll is available');
      await expect(panel.getByRole('button', { name: 'Save changes' })).toBeEnabled();
      await panel.getByRole('button', { name: 'Save changes' }).click();
      await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

      // And it survived the round trip through IndexedDB, which is the whole claim.
      await page.reload({ waitUntil: 'load' });
      const reopened = await openInWorkshop(page, 'The Cold Marches');
      await expect(
        reopened.getByRole('textbox', { name: 'Realm 1 name', exact: true }),
      ).toHaveValue('Ashmarch');
      await expect(
        reopened.getByRole('textbox', { name: 'Settlement 1 name', exact: true }),
      ).toHaveValue('Reviewtown');
      await expect(reopened.getByRole('textbox', { name: 'Region description' })).toHaveValue(
        'An authored gazetteer entry.',
      );
      if (hasEcology) {
        await expect(
          reopened.getByRole('textbox', { name: 'Flora and fauna description' }),
        ).toHaveValue('Marsh reeds sustain local weaving.');
        const ecology = reopened.getByRole('region', { name: 'Flora and fauna', exact: true });
        await expect(ecology).toContainText('Marsh reeds sustain local weaving.');
        await expect(ecology.locator('h4')).toHaveCount(0);
      } else {
        await expect(
          reopened.getByRole('textbox', { name: 'Flora and fauna description' }),
        ).toHaveCount(0);
      }
      await expect(reopened).toContainText('These saved facts need review');
    });
  }

  test('keeps the displayed seed when next-roll controls change', async ({ page }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('inspection-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await page.getByLabel('Seed', { exact: true }).fill('next-region-seed');
    await expect(page.locator('.result-seed')).toContainText('inspection-seed');
    await saveAs(page, 'Inspection region');
    const panel = await openInWorkshop(page, 'Inspection region');
    await expect(panel).toContainText('seed inspection-seed');
    await expect(panel.getByRole('region', { name: 'Region map inspection' })).toBeVisible();
    await expect(panel.getByRole('textbox', { name: 'Region description' })).toBeVisible();
    const download = page.waitForEvent('download');
    await panel.getByRole('button', { name: 'Download Map (SVG)' }).click();
    expect((await download).suggestedFilename()).toMatch(/\.svg$/);
  });

  test('offers map inspection and a concise narrative in a narrow workshop panel', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Region/ })
      .click();
    const panel = page.locator('section.workshop-panel');
    const map = panel.getByRole('region', { name: 'Region map inspection' });
    await expect(map.locator('img.region-map')).toBeVisible({ timeout: 30_000 });
    await map.getByRole('button', { name: 'Zoom in', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(map.getByRole('status')).toHaveText('150%');
    await expectNoHorizontalOverflow(page);
    const viewport = map.getByRole('region', { name: /^Map of/ });
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await map.getByRole('button', { name: 'Fit map' }).click();
    await expect(map.getByRole('status')).toHaveText('100%');
    await expect(panel.getByRole('region', { name: 'Why this region looks this way' })).toHaveCount(
      0,
    );
    await expect(
      panel.getByRole('link', { name: 'Supporting explanation', exact: true }),
    ).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Download Map (SVG)' })).toBeVisible();
  });

  test('can save with no project open and reopen through the vault link', async ({ page }) => {
    await openEmpty(page);
    await openGenerator(page);
    await saveArtifact(page).getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact(page).getByLabel('Name', { exact: true }).fill('First region');
    await saveArtifact(page).getByLabel('New project name').fill('First campaign');
    await saveArtifact(page).getByRole('button', { name: 'Save', exact: true }).click();
    await expect(saveArtifact(page).getByRole('status')).toContainText('Saved “First region”');
    await page
      .locator('section.main')
      .getByRole('link', { name: 'Result Vault', exact: true })
      .click();
    await expect(vaultRow(page, 'First region')).toBeVisible();
  });

  test('moves the seat without rewriting the prose that named the old one', async ({ page }) => {
    // Requirement 4.2: the description may have been rewritten by hand, and a generator that
    // quietly corrects it is regenerating over the user's work.
    await openGenerator(page);
    await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
    await page.getByLabel('Generate neighboring realms').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await saveAs(page, 'Riverlands');

    const panel = await openInWorkshop(page, 'Riverlands');
    const description = panel.getByRole('textbox', { name: 'Region description' });
    const before = await description.inputValue();

    const seat = panel.getByLabel('Seat of the region');
    const options = await seat.locator('option').all();
    expect(options.length).toBeGreaterThan(1);
    await seat.selectOption({ index: options.length - 1 });

    await expect(description).toHaveValue(before);
  });

  test('shows the map and downloads it, which is what a region is', async ({ page }) => {
    // Requirement 6.3. `region_map_svg.ts` had existed the whole time with one caller, a CLI
    // script, and the page never drew the map at all.
    await openGenerator(page);
    // A fixed map makes the icon assertion reproducible; the seed bank covers other layouts.
    await page.getByLabel('Seed', { exact: true }).fill('alpha');
    await page.getByLabel('Lock Seed').check();
    await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.locator('img.region-map')).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Map (SVG)' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.svg$/);

    const contents = await new Response(await file.createReadStream()).text();
    expect(contents.startsWith('<?xml')).toBe(true);
    expect(contents).toContain('</svg>');
    expect(contents).not.toContain('NaN');
    expect(contents).toContain('data-settlement-icon=');
    expect(contents).toContain('data-capital-pennant="true"');
  });

  test('links named landscapes to one primary entry and keeps their facts inspectable', async ({
    page,
  }) => {
    await openGenerator(page);
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const gazetteer = page.locator('.gazetteer');
    const directory = gazetteer.getByRole('navigation', { name: 'Named landscapes' });
    await expect(directory).toBeVisible();
    const links = directory.getByRole('link');
    expect(await links.count()).toBeGreaterThan(0);
    const targetIds: string[] = [];
    for (const link of await links.all()) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#.+landscape-/);
      targetIds.push(href!.slice(1));
      const target = page.locator(`[id="${href!.slice(1)}"]`);
      await expect(target).toHaveCount(1);
      await expect(target.locator('h4')).toHaveText(await link.innerText());
    }
    expect(new Set(targetIds).size).toBe(targetIds.length);
    await links.first().click();
    const first = page.locator(`[id="${targetIds[0]}"]`);
    await first.getByRole('link', { name: 'Inspect facts' }).click();
    const evidence = page.locator('details.inspection');
    await expect(evidence).toHaveAttribute('open');
    await expect(evidence).toContainText('Landscape reading identities and aliases');
    await expect(evidence).toContainText('Notable reading identities and suggested adventures');
    await expect(evidence).toContainText('mapNodeIds');
    const headings = await gazetteer.locator('article h4').allTextContents();
    expect(headings.join(' ')).not.toMatch(/\((?:Second |Third )?Entry\)/);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const file = await download;
    const markdown = await new Response(await file.createReadStream()).text();
    for (const name of await links.allTextContents())
      expect(markdown).toContain(`[${name}](#landscape-`);
    await expectNoHorizontalOverflow(page);
  });

  test('downloads a gazetteer a referee can take to the table', async ({ page }) => {
    await openGenerator(page);
    // Regression seed includes a trading-company name with repeated spaces.
    await page.getByLabel('Seed', { exact: true }).fill('jy9trxlpmbr8h');
    await page.getByLabel('Lock Seed').check();
    await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const heading = await page.locator('section.main h2').first().innerText();
    const gazetteer = page.locator('.gazetteer');
    const entryHeadings = gazetteer.locator('article > h4');
    expect(await entryHeadings.count()).toBeGreaterThan(0);
    const headingTexts = await gazetteer.locator('h2, h3, h4').allTextContents();
    const normalizedHeadings = headingTexts.map((text) =>
      text.trim().replace(/\s+/g, ' ').toLowerCase(),
    );
    expect(new Set(normalizedHeadings).size).toBe(normalizedHeadings.length);
    for (const section of await gazetteer.locator('section').all()) {
      await expect(section.locator(':scope > h3')).toHaveCount(1);
      for (const article of await section.locator('article').all()) {
        const sectionName = await section.locator(':scope > h3').innerText();
        await expect(article.locator(':scope > h4')).toHaveCount(
          ['Settlements', 'Landscape', 'Notable places', 'Organizations'].includes(sectionName) ||
            !!(await article.getAttribute('data-history-event')) ||
            (sectionName === 'Travel' && !!(await article.getAttribute('data-fact-id')))
            ? 1
            : 0,
        );
      }
    }
    const gazetteerText = await page.locator('.gazetteer').textContent();
    await expect(gazetteer.getByRole('heading', { name: 'Inhabitants', exact: true })).toHaveCount(
      0,
    );
    const ecology = gazetteer
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Flora and fauna', exact: true }) });
    if (await ecology.count()) {
      await expect(ecology.locator('article')).toHaveCount(1);
      await expect(ecology.locator('h4')).toHaveCount(0);
      await expect(ecology.locator('[data-gazetteer-text]').first()).not.toBeEmpty();
    }
    expect(gazetteerText).not.toMatch(
      /Recorded map|Recorded climate|isWater =|moisture =|road =|Potential raw|unverified|no cultivated|no established industry|Facts needing review/,
    );
    const settlementCharacter = page.getByRole('region', {
      name: 'Settlements',
      exact: true,
    });
    expect(await settlementCharacter.locator('h4').count()).toBeGreaterThan(0);
    // Editorial prose is bounded and selected; source inventories remain in inspection.
    const generatedParagraphs = await gazetteer
      .locator('[data-gazetteer-text]')
      .evaluateAll((paragraphs) =>
        paragraphs
          .filter(
            (paragraph) => paragraph.closest('section')?.getAttribute('aria-label') !== 'History',
          )
          .map((paragraph) => paragraph.textContent ?? ''),
      );
    const sentenceCount = generatedParagraphs.reduce(
      (sum, text) => sum + (text.match(/[.!?](?:\s|$)/g)?.length ?? 0),
      0,
    );
    expect(sentenceCount).toBeLessThanOrEqual(24);
    const historyParagraphs = await gazetteer
      .getByRole('region', { name: 'History', exact: true })
      .locator('[data-history-event] > [data-gazetteer-text]')
      .allTextContents();
    expect(historyParagraphs.length).toBeLessThanOrEqual(6);
    expect(
      historyParagraphs.reduce((sum, text) => sum + (text.match(/[.!?](?:\s|$)/g)?.length ?? 0), 0),
    ).toBeLessThanOrEqual(6);
    await expect(
      gazetteer.getByRole('heading', { name: 'Regional identity', exact: true }),
    ).toHaveCount(0);

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents.toLowerCase()).toContain(heading.toLowerCase());
    const places = page.locator('[data-notable-id]');
    for (const place of await places.all()) {
      for (const text of await place.locator('[data-gazetteer-text]').allTextContents()) {
        expect(contents).toContain(text);
      }
    }
    for (const paragraph of await page.locator('[data-gazetteer-text]').all()) {
      // Saved prose can contain repeated spaces; innerText collapses them for display.
      // Compare the source text, as the export preserves it verbatim.
      expect(contents).toContain(await paragraph.textContent());
    }
    expect(contents).not.toContain('## Supporting facts and explanations');
    expect(contents).not.toContain('Supporting explanation:');
    await expect(page.locator('.gazetteer details')).toHaveCount(0);
    const evidence = page.locator('details.inspection');
    await expect(evidence).not.toHaveAttribute('open');
    await evidence.locator(':scope > summary').focus();
    await page.keyboard.press('Enter');
    await expect(evidence).toHaveAttribute('open');
    await expect(evidence).toContainText('resource-exploitation: unknown');
    await expect(evidence).toContainText('ruleId');
    await expectNoHorizontalOverflow(page);
    await evidence.locator(':scope > summary').click();
    await expect(evidence).not.toHaveAttribute('open');
    await expect(
      page.getByRole('link', { name: 'Supporting explanation', exact: true }),
    ).toHaveCount(0);

    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PDF' }).click();
    const pdfFile = await pdf;
    expect(pdfFile.suggestedFilename()).toMatch(/\.pdf$/);
    const pdfBytes = await new Response(await pdfFile.createReadStream()).arrayBuffer();
    const pdfContents = new TextDecoder('latin1').decode(pdfBytes);
    expect(pdfContents.startsWith('%PDF')).toBe(true);
    expect(pdfContents).not.toContain('SUPPORTING FACTS AND EXPLANATIONS');
    expect(pdfContents).not.toContain('Supporting explanation:');
    expect(pdfContents).not.toMatch(/Recorded map|Recorded climate|isWater =|moisture =|road =/);
  });

  test('reproduces the same region from the same seed', async ({ page }) => {
    // Requirement 2.2, and the defect the library carried: `getDefaultConfig` seeded both its RNG
    // and its fallback name generator set from the clock, so no seed reproduced a region's names.
    await openGenerator(page);

    await page.getByLabel('Seed', { exact: true }).fill('a-fixed-seed');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const heading = page.locator('section.main h2').first();
    const first = await heading.innerText();

    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).toEqual(first);

    await page.getByLabel('Seed', { exact: true }).fill('a-different-seed');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    expect(await heading.innerText()).not.toEqual(first);
  });
});

test.describe('regional history', () => {
  test.slow();
  test('reads, inspects, edits and exports the saved account in standalone and workshop', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openEmpty(page);
    await createProject(page, 'History project');
    await openGenerator(page);
    await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
    await page.getByLabel('Seed', { exact: true }).fill('5wyedz5q272fz');
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const history = page
      .locator('.gazetteer')
      .getByRole('region', { name: 'History', exact: true });
    await expect(history).toBeVisible();
    const words = await history.locator('[data-gazetteer-text]').allTextContents();
    expect(words.length).toBeGreaterThan(0);
    expect(words.length).toBeLessThanOrEqual(6);
    const sections = await page.locator('.gazetteer > section > h3').allTextContents();
    expect(sections.indexOf('History')).toBeLessThan(sections.indexOf('Landscape'));
    const explains = history.getByRole('link', { name: /^Explains:/ }).first();
    const href = await explains.getAttribute('href');
    await explains.focus();
    await page.keyboard.press('Enter');
    const source = page.locator(`[id="${href!.slice(1)}"]`);
    await expect(source.locator(':scope > summary')).toBeFocused();
    await expect(source).toHaveAttribute('open', '');
    await history.getByRole('link', { name: 'Inspect history', exact: true }).first().click();
    await expect(page.locator('details.inspection')).toContainText(
      'Present facts constrain what they may say',
    );
    await expect(page.locator('details.inspection details[open]').first()).toContainText('Rule:');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdown = await new Response(await (await download).createReadStream()).text();
    for (const sentence of words) expect(markdown).toContain(sentence);
    await saveAs(page, 'Saved History');
    await page.reload({ waitUntil: 'load' });
    const panel = await openInWorkshop(page, 'Saved History');
    const savedHistory = panel
      .locator('.gazetteer')
      .getByRole('region', { name: 'History', exact: true });
    await expect(savedHistory).toBeVisible();
    expect(await savedHistory.locator('[data-gazetteer-text]').allTextContents()).toEqual(words);
    await panel.locator('.history-editor > summary').focus();
    await page.keyboard.press('Enter');
    const editor = panel.locator('.history-editor');
    const description = editor.getByLabel('History event 1 description', { exact: true });
    await description.fill('The referee records an uncertain beginning.');
    await expect(savedHistory).toContainText('The referee records an uncertain beginning.');
    const firstDate = editor.getByLabel('History event 1 years before present', { exact: true });
    await firstDate.fill('100');
    await firstDate.press('Tab');
    await expect(savedHistory).toContainText('100 years before the present');
    const secondDate = editor.getByLabel('History event 2 years before present', { exact: true });
    await secondDate.fill('200');
    await secondDate.press('Tab');
    await expect(editor.getByRole('alert')).toBeVisible();
    await expect(secondDate).toHaveValue('');
    await firstDate.fill('');
    await firstDate.press('Tab');
    await editor.getByRole('button', { name: 'Move history event 2 later', exact: true }).click();
    await expect(editor.getByLabel('History event 3 name', { exact: true })).toHaveValue(
      /Founding/,
    );
    // The old realm's fall cannot precede its founding, and authored dependents protect it.
    await editor.getByRole('button', { name: 'Move history event 4 earlier', exact: true }).click();
    await expect(editor.getByRole('alert')).toBeVisible();
    await editor
      .getByLabel('History event 4 description', { exact: true })
      .fill('An authored account of the former realm falling.');
    await editor.getByRole('button', { name: 'Remove history event 3', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toContainText('Authored history prevents removal:');
    await page.getByRole('alertdialog').getByRole('button', { name: 'OK', exact: true }).click();
    // An intentional blank remains blank after persistence and export.
    await description.fill('');
    await expect(description).toHaveValue('');
    const actor = editor.getByLabel('Historical actor 1 name', { exact: true });
    await expect(actor).toBeVisible();
    {
      await actor.fill('The Remembered Realm');
      await actor.press('Tab');
      await expect(savedHistory).toContainText('History needs review');
    }
    for (const width of [320, 360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await description.scrollIntoViewIfNeeded();
      await expectNoHorizontalOverflow(page);
      await expect(description).toBeVisible();
    }
    await page.screenshot({
      path: testInfo.outputPath('history-editor-mobile.png'),
      animations: 'disabled',
    });
    await panel.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
    await page.reload({ waitUntil: 'load' });
    const reopened = await openInWorkshop(page, 'Saved History');
    await reopened.locator('.history-editor > summary').click();
    await expect(reopened.getByLabel('History event 1 description', { exact: true })).toHaveValue(
      '',
    );
    // Remove a leaf event: the confirmation describes actual saved impact.
    const remove = reopened
      .locator('.history-editor')
      .getByRole('button', { name: /^Remove history event \d+$/ })
      .last();
    const count = await reopened.locator('[data-history-editor-event]').count();
    await remove.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('History events to remove:');
    await dialog.getByRole('button', { name: 'Remove history event', exact: true }).click();
    await expect(reopened.locator('[data-history-editor-event]')).toHaveCount(count - 1);
    const pdfDownload = page.waitForEvent('download');
    await reopened.getByRole('button', { name: 'Download PDF', exact: true }).click();
    expect((await pdfDownload).suggestedFilename()).toMatch(/\.pdf$/);
    await reopened.getByRole('button', { name: 'Roll again', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toContainText('history');
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancel', exact: true })
      .click();
    expect(errors).toEqual([]);
  });
});
