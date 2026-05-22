import { test } from '@playwright/test';
import { GENERATE_TEST_PAGES } from './page_manifest';
import {
  clickGenerateButton,
  expectGeneratorOutput,
  visitRoute,
} from './helpers';

for (const entry of GENERATE_TEST_PAGES) {
  test(`generate: ${entry.path}`, async ({ page }) => {
    test.setTimeout(entry.webgl ? 60_000 : 30_000);

    await visitRoute(page, entry.path, { webgl: entry.webgl });

    if (entry.kind === 'tool' && entry.outputCheck === 'stats') {
      await expectGeneratorOutput(page, 'stats');
      return;
    }

    const buttonTimeout = entry.webgl ? 30_000 : 15_000;
    await clickGenerateButton(
      page,
      entry.generateButton ?? /^Generate/i,
      buttonTimeout,
      Boolean(entry.webgl),
    );
    await expectGeneratorOutput(page, entry.outputCheck ?? 'default');
  });
}
