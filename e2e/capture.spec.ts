import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { test } from '@playwright/test';

import { GENERATE_TEST_PAGES, PAGE_MANIFEST } from './page_manifest';
import { clickGenerateButton, visitRoute } from './helpers';

/**
 * Screenshots every route in the manifest, for a human to look at.
 *
 * `docs/visual-design.md`, "The capture is a tool, not a gate". This suite asserts **nothing**. It
 * is excluded from every default project and runs only when it is asked for by name:
 *
 * ```
 * CAPTURE=1 npx playwright test --project=capture
 * CAPTURE=1 npx playwright test --project=capture-360
 * ```
 *
 * The env var is what makes it dispatch-only. A Playwright project with no filter runs on a bare
 * `playwright test` — `testMatch` chooses which files a project runs, not whether the project runs
 * — so the first version of this put two hundred and forty screenshots into `verify:all`.
 *
 * **It is deliberately not a golden-image suite.** Pixel baselines for forty-one routes would need
 * regenerating on every deliberate change to a shared component — which is most changes — to catch
 * a class of bug the sweeps in `src/lib/styles/tokens.test.ts` already catch by construction, and
 * an image comparison that fails a build on an intended change trains everyone to ignore it.
 * `goldens.yaml` makes the same trade for the renderers: it renders baselines, pushes them for
 * review, and gates nothing.
 *
 * A pinned seed, so two captures of the same route differ only where the design differs and not
 * because a generator rolled differently.
 */
const CAPTURE_DIR = process.env.CAPTURE_DIR ?? 'capture';

test.describe.configure({ mode: 'parallel' });

for (const entry of PAGE_MANIFEST) {
  test(`capture: ${entry.path}`, async ({ page }, testInfo) => {
    test.setTimeout(entry.webgl ? 90_000 : 30_000);
    await visitRoute(page, entry.path, { title: entry.title, webgl: entry.webgl });

    // Generated, where there is something to generate. An empty generator page shows its controls
    // and nothing else, and the surfaces this walk is looking hardest at — the result cards, the
    // stat blocks, the tables — only exist once a tool has run. Failures are swallowed on purpose:
    // this suite reports nothing, and `pages.generate.spec.ts` is what asserts a tool still works.
    const generates = GENERATE_TEST_PAGES.find((candidate) => candidate.path === entry.path);
    if (generates !== undefined && generates.kind !== 'reference') {
      try {
        await clickGenerateButton(
          page,
          generates.generateButton,
          entry.webgl ? 30_000 : 15_000,
          Boolean(entry.webgl),
        );
      } catch {
        // A tool that will not run is a finding for `pages.generate.spec.ts`, not for a capture.
      }
    }

    // The project name is the width, so one directory holds one width's worth of the site and the
    // reviewer compares across directories rather than across filenames.
    const directory = join(CAPTURE_DIR, testInfo.project.name);
    await mkdir(directory, { recursive: true });

    // `fullPage` captures nothing extra here, and that is a property of the shell rather than a
    // quirk of Playwright: `.shell` is a `100dvh` grid and scrolling happens *inside* the page
    // region, so the document is always exactly one viewport tall. Grow the viewport to the page
    // region's own scroll height instead, capped so a reference page with two hundred rows does
    // not produce an image nobody can open.
    const tall = await page.evaluate(() => {
      const region = document.querySelector('main.shell__page');
      return region === null ? 0 : region.scrollHeight;
    });
    const width = page.viewportSize()?.width ?? 1280;
    await page.setViewportSize({ width, height: Math.min(Math.max(tall + 64, 720), 4000) });

    const name = entry.path === '/' ? 'home' : entry.path.replaceAll('/', '_').replace(/^_/, '');
    await page.screenshot({ path: join(directory, `${name}.png`) });
  });
}
