import { expect, test } from '@playwright/test';

import { visitRoute } from './helpers';
import { releaseNoteEntries } from '../src/lib/release_notes';

test.describe('release notes', () => {
  test('splits an entry into headed categories', async ({ page }) => {
    await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });

    // Choose a recorded entry containing all four categories; newer releases may omit some.
    const index = releaseNoteEntries.findIndex((entry) =>
      [entry.features, entry.improvements, entry.fixes, entry.housekeeping].every(
        (items) => (items?.length ?? 0) > 0,
      ),
    );
    expect(index).toBeGreaterThanOrEqual(0);
    const categorized = page.locator('section.release-notes > div').nth(index);

    await expect(
      categorized.getByRole('heading', { name: 'New features', level: 3 }),
    ).toBeVisible();
    await expect(
      categorized.getByRole('heading', { name: 'Improvements', level: 3 }),
    ).toBeVisible();
    await expect(categorized.getByRole('heading', { name: 'Bug fixes', level: 3 })).toBeVisible();
    await expect(
      categorized.getByRole('heading', { name: 'Housekeeping', level: 3 }),
    ).toBeVisible();
  });

  test('shows a version on the entries that had a release, and nothing where there was none', async ({
    page,
  }) => {
    await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });

    const versions = releaseNoteEntries.flatMap((entry) =>
      entry.version ? [`v${entry.version}`] : [],
    );
    await expect(page.locator('.version')).toHaveText(versions);
  });

  test('gives every entry a summary', async ({ page }) => {
    await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });

    const entries = page.locator('section.release-notes > div');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const summary = entries.nth(i).locator('> p').first();
      await expect(summary).not.toBeEmpty();
    }
  });

  /**
   * `/changelog` became `/release-notes` (#29), and redirects rather than 404s. Five years of
   * entries have been linked to under the old path, so this is the piece of its coverage that
   * outlives the rename.
   */
  test('the old changelog path sends you to the release notes', async ({ page }) => {
    await visitRoute(page, '/changelog', { title: 'Release Notes | Iron Arachne' });

    await expect(page).toHaveURL(/\/release-notes\/?$/);
    await expect(page.getByRole('heading', { name: 'Release Notes', level: 1 })).toBeVisible();
  });

  test('the footer says which version you are looking at', async ({ page }) => {
    await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });

    await expect(page.locator('footer').getByText(/^Version \d+\.\d+\.\d+/)).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: "what's new" })).toBeVisible();
  });
});
