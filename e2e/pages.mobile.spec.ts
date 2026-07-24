import { test } from '@playwright/test';
import { PAGE_MANIFEST, type PageEntry } from './page_manifest';
import {
  clickGenerateButton,
  expectGeneratorOutput,
  expectGlobalChrome,
  expectPageContent,
  visitRoute,
} from './helpers';
import {
  expectInteractiveControlsReachable,
  expectNoHorizontalOverflow,
  pinGeneratorSeed,
} from './mobile_layout';

/**
 * The mobile baseline. Runs once per width in MOBILE_VIEWPORTS via the
 * `mobile-*` Playwright projects, so a redesign aimed at desktop that stops
 * fitting a phone screen fails here before it ships.
 *
 * Generator pages are checked with content on screen rather than empty: long
 * names and wide stat tables are the usual cause of a page outgrowing a phone,
 * and an empty form proves little.
 */
function producesOutput(entry: PageEntry): boolean {
  return entry.kind === 'generator' || entry.kind === 'tool';
}

for (const entry of PAGE_MANIFEST) {
  test(`mobile layout: ${entry.path}`, async ({ page }) => {
    test.setTimeout(entry.webgl ? 90_000 : 45_000);

    await visitRoute(page, entry.path, { title: entry.title, webgl: entry.webgl });

    await expectGlobalChrome(page);
    await expectPageContent(page, entry);

    if (producesOutput(entry)) {
      await pinGeneratorSeed(page);

      // The species stats tool derives its output from the form, with no button.
      if (entry.outputCheck !== 'stats') {
        const buttonTimeout = entry.webgl ? 30_000 : 15_000;
        await clickGenerateButton(page, entry.generateButton, buttonTimeout, Boolean(entry.webgl));
      }

      await expectGeneratorOutput(page, entry.outputCheck ?? 'default');
    }

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  });
}
