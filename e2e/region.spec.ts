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
      await panel
        .getByRole('textbox', { name: 'Flora and fauna description' })
        .fill('Marsh reeds sustain local weaving.');
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
      await expect(
        reopened.getByRole('textbox', { name: 'Flora and fauna description' }),
      ).toHaveValue('Marsh reeds sustain local weaving.');
      const ecology = reopened.getByRole('region', { name: 'Flora and fauna', exact: true });
      await expect(ecology).toContainText('Marsh reeds sustain local weaving.');
      await expect(ecology.locator('h4')).toHaveCount(0);
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

  test('downloads a gazetteer a referee can take to the table', async ({ page }) => {
    await openGenerator(page);
    await page.getByLabel('Affiliation', { exact: true }).selectOption('affiliated');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const heading = await page.locator('section.main h2').first().innerText();
    const gazetteer = page.locator('.gazetteer');
    const entryHeadings = gazetteer.locator('article > h4');
    expect(await entryHeadings.count()).toBeGreaterThan(0);
    const headingTexts = await gazetteer.locator('h2, h3, h4, h5').allTextContents();
    const normalizedHeadings = headingTexts.map((text) =>
      text.trim().replace(/\s+/g, ' ').toLowerCase(),
    );
    expect(new Set(normalizedHeadings).size).toBe(normalizedHeadings.length);
    for (const section of await gazetteer.locator('section').all()) {
      await expect(section.locator(':scope > h3')).toHaveCount(1);
      for (const article of await section.locator('article').all()) {
        await expect(article.locator(':scope > h4')).toHaveCount(
          (await article.getAttribute('data-fact-id')) === 'area:land' ||
            (await section.locator(':scope > h3').innerText()) === 'Flora and fauna'
            ? 0
            : 1,
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
    expect(gazetteerText).not.toMatch(/Recorded map|Recorded climate|isWater =|moisture =|road =/);
    const settlementCharacter = page.getByRole('region', {
      name: 'Settlements',
      exact: true,
    });
    await expect(
      settlementCharacter
        .getByRole('heading', { level: 5, name: /^Settlement character of / })
        .first(),
    ).toBeVisible();
    await expect(
      gazetteer.getByRole('heading', { level: 3, name: 'Livelihoods', exact: true }),
    ).toHaveCount(0);
    await expect(
      gazetteer.getByRole('heading', { level: 3, name: 'Settlement character', exact: true }),
    ).toHaveCount(0);
    await expect(settlementCharacter).toContainText('Local work —');
    await expect(settlementCharacter).toContainText('Supply needs —');
    const landscape = page.getByRole('region', { name: 'Landscape', exact: true });
    await expect(landscape.locator('[data-fact-id="area:land"] > p')).toBeVisible();
    await expect(landscape.getByRole('heading', { name: /Regional land/i })).toHaveCount(0);
    await expect(landscape.getByRole('heading', { name: /^The Landscape of / })).toHaveCount(0);
    const zoneHeadings = landscape.locator('[data-fact-id^="area:habitat-zone:"] > h4');
    expect(await zoneHeadings.count()).toBeGreaterThan(0);
    for (const name of await zoneHeadings.allTextContents()) {
      expect(name).not.toMatch(/zone$/);
      expect(name.trim().length).toBeGreaterThan(0);
    }
    await expect(landscape.locator('[data-fact-id^="habitat:"] > h4').first()).toContainText(
      'across the region',
    );
    await expect(landscape).not.toContainText(
      /cells|edges|median|°C|0–1|temperatures of|moisture of|not achieved/,
    );

    const markdown = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Markdown' }).click();
    const markdownFile = await markdown;
    expect(markdownFile.suggestedFilename()).toMatch(/\.md$/);
    const contents = await new Response(await markdownFile.createReadStream()).text();
    expect(contents.toLowerCase()).toContain(heading.toLowerCase());
    expect(contents).toContain('## Realms');
    const places = page.locator('[data-notable-id]');
    expect(await places.count()).toBeGreaterThan(0);
    for (const place of await places.all()) {
      for (const text of await place.locator('[data-gazetteer-text]').allTextContents()) {
        expect(contents).toContain(text);
      }
    }
    for (const paragraph of await page.locator('[data-gazetteer-text]').all()) {
      expect(contents).toContain(await paragraph.innerText());
    }
    expect(contents).toContain('Hook:');
    expect(contents).not.toContain('## Supporting facts and explanations');
    expect(contents).not.toContain('Supporting explanation:');
    await expect(page.locator('.gazetteer details')).toHaveCount(0);
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
