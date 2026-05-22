import { test } from '@playwright/test';
import { PAGE_MANIFEST } from './page_manifest';
import { expectGlobalChrome, expectPageContent, visitRoute } from './helpers';

for (const entry of PAGE_MANIFEST) {
  test(`smoke: ${entry.path}`, async ({ page }) => {
    await visitRoute(page, entry.path, { title: entry.title, webgl: entry.webgl });
    await expectGlobalChrome(page);
    await expectPageContent(page, entry);
  });
}
