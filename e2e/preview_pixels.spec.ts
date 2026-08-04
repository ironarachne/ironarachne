import { expect, test } from '@playwright/test';
import { PREVIEW_CASES, openPinnedPreview, readImageStats } from './preview_fixtures';

/**
 * What an astronomical preview actually drew, asserted as properties of the image rather than
 * against a committed baseline.
 *
 * This is the tier that catches "the shader renders solid black". Until it existed, the strongest
 * claim anything in this repository made about a preview was that an `img` element was visible, so
 * a renderer that drew nothing at all passed every check we had.
 *
 * It is deliberately not a golden-image test, and it is not a weaker one either — it is a different
 * question. A baseline asks "is this the same picture as last time", which is sensitive to the
 * machine that drew it; this asks "is this a picture of a planet", which is not. Both are wanted,
 * and `preview_goldens.spec.ts` is the other. Assertions here are about structure — something is
 * lit, it is in the right place, the sky is dark, the image is not one flat colour — so a change
 * that legitimately alters the shading does not fail them, and a renderer that has stopped drawing
 * cannot pass them.
 */
for (const testCase of PREVIEW_CASES) {
  test(`preview pixels: ${testCase.name}`, async ({ page }) => {
    test.setTimeout(60_000);

    const image = await openPinnedPreview(page, testCase);
    const stats = await readImageStats(image);

    expect(stats.width).toBeGreaterThan(0);
    expect(stats.height).toBeGreaterThan(0);

    // Not a blank frame, in either direction: a black canvas and a white one both fail here.
    expect(stats.distinctColors).toBeGreaterThan(16);
    expect(stats.maxLuminance).toBeGreaterThan(0.2);
    expect(stats.meanLuminance).toBeGreaterThan(0.002);
    expect(stats.meanLuminance).toBeLessThan(0.8);

    // The sky is dark and the body is not, which is the whole composition in one assertion.
    expect(stats.cornerMeanLuminance).toBeLessThan(0.25);
    expect(stats.centerMeanLuminance).toBeGreaterThan(stats.cornerMeanLuminance * 2);

    if (testCase.composite) {
      // A system strip is several bodies spread across it, so the light is spread out rather than
      // pooled in the middle: at least three of the twelve bands carry something.
      const litBands = stats.bandLuminance.filter(
        (luminance) => luminance > stats.cornerMeanLuminance * 2,
      );
      expect(litBands.length).toBeGreaterThanOrEqual(3);
      return;
    }

    // One body, drawn where the scene puts it: at the centre of its own preview. A body drawn at
    // the origin, or off the plane entirely, moves this well outside the tolerance.
    expect(stats.brightCentroidX).toBeGreaterThan(0.35);
    expect(stats.brightCentroidX).toBeLessThan(0.65);
    expect(stats.brightCentroidY).toBeGreaterThan(0.35);
    expect(stats.brightCentroidY).toBeLessThan(0.65);
  });
}

/**
 * Nothing here compares one backend's pixels to the other's. That contract is composition, not
 * pixels, and it is asserted exactly where it can be asserted exactly — on the scene, in
 * `src/lib/renderers/cross_backend_scene.test.ts`. A luminance centroid cannot tell a body drawn
 * somewhere else from a body lit differently, so a pixel-level version of that test would be a
 * weaker claim wearing a stronger one's clothes.
 *
 * What does belong here is the contract between *tiers*, because it is about the image and nothing
 * else: a reduced-quality render is drawn with a quarter of the fragments and must still come back
 * at the size that was asked for. A half-size preview would resize the page under whoever is
 * waiting for it.
 */
test('a locked seed reproduces the same star system, previews and all', async ({ page }) => {
  test.setTimeout(60_000);

  // The seed control's whole promise. It was not kept: the page never wired its own RNG into the
  // system config, which seeds itself from `Date.now()`, so a locked seed produced a different
  // system every time — and the preview seeds were re-drawn on every rebuild, so changing the
  // renderer changed the pictures too. Both are cheap to break again and invisible without this.
  const systemCase = PREVIEW_CASES.find((entry) => entry.name === 'system-webgl-full');
  if (systemCase === undefined) throw new Error('missing preview case');

  const capture = async () => {
    const image = await openPinnedPreview(page, systemCase);
    return {
      source: await image.getAttribute('src'),
      description: await page.locator('h2').first().innerText(),
    };
  };

  const first = await capture();
  const second = await capture();

  expect(second.description).toBe(first.description);
  expect(second.source).toBe(first.source);
});

test('a reduced-quality preview is the same picture at the same size', async ({ page }) => {
  test.setTimeout(60_000);

  const fullCase = PREVIEW_CASES.find((entry) => entry.name === 'planet-webgl-full');
  const reducedCase = PREVIEW_CASES.find((entry) => entry.name === 'planet-webgl-reduced');
  if (fullCase === undefined || reducedCase === undefined) throw new Error('missing preview case');

  const full = await readImageStats(await openPinnedPreview(page, fullCase));
  const reduced = await readImageStats(await openPinnedPreview(page, reducedCase));

  expect(reduced.width).toBe(full.width);
  expect(reduced.height).toBe(full.height);
  // Same scene, same layout, less surface detail: the light lands in the same place.
  expect(reduced.brightCentroidX).toBeCloseTo(full.brightCentroidX, 1);
  expect(reduced.brightCentroidY).toBeCloseTo(full.brightCentroidY, 1);
});
