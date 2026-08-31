import { expect, test } from '@playwright/test';
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
import { createProject } from './projects';

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

/**
 * The shell carrying a project name, which is the one piece of text in the top bar the user
 * writes and therefore the one that can be any length at all.
 *
 * Every test above visits a route in a fresh browser with an empty vault, where the bar reads
 * "Project: None" and fits any phone. That is why a long name shipped: the bar was never measured
 * with a real one in it. A name this long used to push the header past the viewport, and because
 * the top bar is shell furniture rather than page content, it made *every page in the app* scroll
 * sideways at once.
 */
const LONG_PROJECT_NAME = 'The Shattered Coast of Vel Anareth';

test(`mobile layout: the shell with a project open`, async ({ page }) => {
  await visitRoute(page, '/');
  await createProject(page, LONG_PROJECT_NAME);

  // The name has to actually be in the bar before measuring it, or this passes by measuring
  // "None". The top bar reads the vault after hydrating it, so the name arrives a tick after the
  // navigation settles.
  await expect(page.locator('.top-bar__stat--project dd')).toHaveText(LONG_PROJECT_NAME);

  // Checked on Home and on a generator: the bar is the same element on both, but a page that
  // already fills its width is where an over-wide bar shows up as something other than the bar.
  for (const path of ['/', '/character']) {
    await visitRoute(page, path);
    await expect(page.locator('.top-bar__stat--project dd')).toHaveText(LONG_PROJECT_NAME);

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  }
});
