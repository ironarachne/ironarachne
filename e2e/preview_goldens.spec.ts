import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { PREVIEW_CASES, openPinnedPreview } from './preview_fixtures';

/**
 * Golden images for the astronomical previews: the same handful of pinned cases as
 * `preview_pixels.spec.ts`, compared against a committed baseline.
 *
 * ## Baselines come from CI, and a missing one skips
 *
 * CI rasterizes WebGL on the CPU through SwiftShader and a developer machine may not, so a baseline
 * captured on one will not match the other at any tolerance loose enough to still catch a black
 * frame. Running `--update-snapshots` locally is how this tier becomes permanently red and then
 * quietly disabled, so **do not**. `.worktree/workflows/goldens.yaml` generates them in CI; the
 * loop is written up in `src/lib/renderers/README.md`.
 *
 * A case with no baseline **skips** rather than writing one and failing, because this suite runs on
 * merges to `main` where a first run has nowhere to put a new file and nothing to compare it to.
 * A skip here says "no baseline yet", never "this passed".
 *
 * ## The tolerance is small on purpose
 *
 * Locally, and in separate browser launches, these renders come out byte-identical; the tolerance
 * covers a different machine's floating point, not a different picture. If CI ever needs it
 * widened past the point where a structural change still fails, that is evidence the tier is not
 * viable on this infrastructure, and the answer is to record that in `docs/renderers.md` — not to
 * widen it until nothing can fail. A screenshot test that cannot fail is worse than none, because
 * decision 4 leans on this one being real.
 */
const GOLDEN_TOLERANCE = {
  maxDiffPixelRatio: 0.002,
  threshold: 0.2,
} as const;

for (const testCase of PREVIEW_CASES) {
  test(`preview golden: ${testCase.name}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    const snapshot = `${testCase.name}.png`;

    // `updateSnapshots` defaults to `missing`, which would write a baseline on the spot and fail
    // the run — on `main`, where the file it wrote goes nowhere and nobody sees why the run is red.
    // So a missing baseline skips, except when someone has explicitly asked to write one, which is
    // what the generation workflow does.
    const updating =
      testInfo.config.updateSnapshots === 'all' || testInfo.config.updateSnapshots === 'changed';
    test.skip(
      !updating && !existsSync(testInfo.snapshotPath(snapshot)),
      `no committed baseline for ${testCase.name}; generate one with the goldens workflow`,
    );

    const image = await openPinnedPreview(page, testCase);

    await expect(image).toHaveScreenshot(snapshot, {
      ...GOLDEN_TOLERANCE,
      animations: 'disabled',
    });
  });
}
