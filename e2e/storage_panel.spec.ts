import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';
import { createProject, projectCard, projectsPage } from './projects';

/**
 * The storage panel and the eighty per cent banner (docs/storage-panel.md, #27).
 *
 * **Nothing here asserts what the browser decided** about persistence or quota. Headless
 * Chromium's answers are not ours to pin: a suite that depended on them would fail on a browser
 * upgrade for a reason that has nothing to do with this feature. Where a figure is needed the test
 * installs one, which is a stub of an API rather than an assertion about one. What is testable is
 * what the user is told, and in what order.
 */

const storagePanel = (page: Page) => page.locator('section.storage');
const storageRow = (page: Page, name: string) =>
  storagePanel(page).locator('tbody tr', { hasText: name });
const warningBanner = (page: Page) => page.locator('.storage-warning');

/** A usage that is comfortably under the threshold, and one that is over it, of a two gig quota. */
const QUOTA_BYTES = 2 * 1024 * 1024 * 1024;
const ROOMY_USAGE_BYTES = 100 * 1024 * 1024;
const NEARLY_FULL_USAGE_BYTES = 1_825_361_100;

/**
 * Answer `estimate()` with figures of our own, or take the storage manager away entirely.
 *
 * An init script rather than an `evaluate`, because the panel reads the estimate on mount and a
 * stub installed after the page has loaded would be installed too late. It applies from the next
 * navigation onwards, so every caller navigates or reloads after calling this.
 */
async function stubEstimate(
  page: Page,
  estimate: { usage: number; quota: number } | null,
): Promise<void> {
  await page.addInitScript((value: { usage: number; quota: number } | null) => {
    if (value === null) {
      // A browser with no storage manager at all — the case the "unknown" branches exist for.
      Object.defineProperty(Navigator.prototype, 'storage', {
        configurable: true,
        get: () => undefined,
      });
      return;
    }
    Object.defineProperty(navigator.storage, 'estimate', {
      configurable: true,
      value: () => Promise.resolve(value),
    });
  }, estimate);
}

/** Wipe the origin, whichever route the caller is standing on. */
async function emptyTheVault(page: Page): Promise<void> {
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

async function openEmptyProjects(page: Page): Promise<void> {
  await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });
  await emptyTheVault(page);
}

async function openEmptyWorkshop(page: Page): Promise<void> {
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
  await emptyTheVault(page);
}

/** Create a project from the page the caller is already on. */
async function create(page: Page, name: string): Promise<void> {
  await projectsPage(page).getByLabel('New project').fill(name);
  await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
  await expect(projectCard(page, name)).toBeVisible();
}

/** Mount the culture generator and keep what it made, so a project has bytes to its name. */
async function saveACultureFromTheWorkshop(page: Page, name: string): Promise<void> {
  const returnTo = new URL(page.url()).pathname;

  await page.goto('/workshop/');
  await page
    .locator('section.tool-browser')
    .getByRole('button', { name: /^Culture/ })
    .click();
  const saveArtifact = page.locator('.save-artifact');
  await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
  await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
  await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.locator('section.project-view').getByRole('button', { name: new RegExp(`^${name}`) }),
  ).toBeVisible();

  await page.goto(returnTo);
}

test.describe('the storage panel', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyProjects(page);
  });

  test('says what is stored in the order the design asks for', async ({ page }) => {
    // Export recency leads because fullness predicts inconvenience where export recency predicts
    // loss. The order is the design, not a layout preference.
    await expect(storagePanel(page).locator('h2, h3')).toHaveText([
      'Storage',
      'Protection',
      'Usage',
      'Restore from a backup',
      'This project',
    ]);

    await expect(storagePanel(page).locator('.storage__headline')).toHaveText('Never exported');
    await expect(
      storagePanel(page).getByRole('button', { name: 'Export everything' }),
    ).toBeVisible();
  });

  test('never shows a percentage without the sizes it came from', async ({ page }) => {
    await stubEstimate(page, { usage: 251_658_240, quota: QUOTA_BYTES });
    await page.reload({ waitUntil: 'load' });

    // One sentence out of one function: the figure and its two sizes cannot be separated by an
    // edit to a template, because no template composes them.
    await expect(storagePanel(page).locator('.storage__usage')).toHaveText(
      'Using about 240 MB of roughly 2 GB — about 12%.',
    );
  });

  test('reports unknowns as unknown rather than as zero', async ({ page }) => {
    await stubEstimate(page, null);
    await page.reload({ waitUntil: 'load' });
    await create(page, 'Ashfall');

    await expect(storagePanel(page).locator('.storage__usage')).toHaveText(
      'This browser will not say how much room this site is using.',
    );
    await expect(storagePanel(page).locator('.storage__protection')).toHaveText(
      'This browser will not say whether it keeps your work.',
    );
    // A browser that will not answer is not a browser reporting nought per cent.
    await expect(storagePanel(page).locator('.storage__usage')).not.toContainText('%');

    // The per-project sums are the vault's own accounting, so they are exact and still here.
    await expect(storageRow(page, 'Ashfall')).toContainText('0 B');
  });

  test('lists projects largest first, and points each row at its card', async ({ page }) => {
    await create(page, 'Ashfall');
    await create(page, 'Tallow');
    // Creating a project opens it, so this lands in Tallow and leaves Ashfall empty.
    await saveACultureFromTheWorkshop(page, 'The Emberfolk');

    // The table answers "which one is big", which is a different question from the cards' "which
    // one am I working in" — hence a different order for the same projects.
    await expect(storagePanel(page).locator('tbody td[data-label="Project"]')).toHaveText([
      'Tallow',
      'Ashfall',
    ]);
    await expect(storageRow(page, 'Tallow')).toContainText('Never exported');

    // The row carries no Delete of its own; it hands the reader to the card that has one.
    await storageRow(page, 'Tallow').getByRole('link', { name: 'Tallow' }).click();
    await expect(projectCard(page, 'Tallow')).toBeInViewport();
  });

  test('exports the whole vault and then says when that was', async ({ page }) => {
    await create(page, 'Ashfall');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      storagePanel(page).getByRole('button', { name: 'Export everything' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^ironarachne-vault-\d{4}-\d{2}-\d{2}\.json$/);

    // The stamp is written only because the browser took the file, and the panel leads with it.
    await expect(storagePanel(page).locator('.storage__headline')).toHaveText(
      'Last exported today',
    );
  });
});

/**
 * The eighty per cent banner: the one thing on the workshop allowed to raise its voice, and only
 * when the browser really is nearly full.
 */
test.describe('being warned that the browser is nearly full', () => {
  test('stays quiet while there is room', async ({ page }) => {
    await stubEstimate(page, { usage: ROOMY_USAGE_BYTES, quota: QUOTA_BYTES });
    await openEmptyWorkshop(page);

    await expect(warningBanner(page)).toHaveCount(0);
  });

  test('speaks up where the user is working, and comes back next session', async ({ page }) => {
    await stubEstimate(page, { usage: NEARLY_FULL_USAGE_BYTES, quota: QUOTA_BYTES });
    await openEmptyWorkshop(page);

    await expect(warningBanner(page)).toContainText('This browser is nearly full for this site.');
    // The same rule as the panel: the percentage arrives with the sizes it came from.
    await expect(warningBanner(page)).toContainText(
      'Using about 1.7 GB of roughly 2 GB — about 85%.',
    );

    // Dismissible, because it is not modal and the user may have nothing to do about it now.
    await warningBanner(page).getByRole('button', { name: 'Dismiss' }).click();
    await expect(warningBanner(page)).toHaveCount(0);

    // But not silenceable: the condition is still true, so a fresh page says so again.
    await page.reload({ waitUntil: 'load' });
    await expect(warningBanner(page)).toBeVisible();
  });

  test('leads to the panel that can act on it', async ({ page }) => {
    await stubEstimate(page, { usage: NEARLY_FULL_USAGE_BYTES, quota: QUOTA_BYTES });
    await openEmptyWorkshop(page);

    await warningBanner(page).getByRole('link', { name: 'Storage and backup' }).click();
    await expect(
      storagePanel(page).getByRole('button', { name: 'Export everything' }),
    ).toBeInViewport();
  });

  test('is not the only way to reach the panel from the workshop', async ({ page }) => {
    await openEmptyWorkshop(page);
    await createProject(page, 'Ashfall');

    await page.locator('section.project-context').getByRole('link', { name: 'Storage' }).click();
    await expect(
      storagePanel(page).getByRole('button', { name: 'Export everything' }),
    ).toBeInViewport();
  });
});
