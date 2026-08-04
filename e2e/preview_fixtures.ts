import type { Locator, Page } from '@playwright/test';

/**
 * Shared setup for the two tiers that look at what an astronomical preview actually draws:
 * `preview_pixels.spec.ts`, which asserts properties of the image, and `preview_goldens.spec.ts`,
 * which compares it to a committed baseline.
 *
 * Everything a preview depends on is pinned here, and there are three such things rather than the
 * obvious one:
 *
 * - **The seed**, which fixes the body and the picture drawn of it.
 * - **The backend**, so the case under test is the one named rather than whatever the machine
 *   resolved to. CI rasterizes WebGL on the CPU, and would otherwise start at `reduced`.
 * - **The quality**, which is less obvious and matters more. Without an override the site drops a
 *   tier when a render overruns its budget, so the picture would depend on how loaded the machine
 *   was that minute. Pinning quality is what makes these tests independent of a busy runner.
 */
export type PreviewBackend = 'webgl' | 'canvas2d';
export type PreviewQuality = 'full' | 'reduced';

export type PreviewCase = {
  /** Stable: it names the golden file. Renaming one orphans its baseline. */
  name: string;
  path: string;
  backend: PreviewBackend;
  quality: PreviewQuality;
  seed: string;
  forceRings?: boolean;
  /** Which image on the page, in DOM order, among the preview images. */
  nth?: number;
  /** A wide multi-body strip rather than a single body on its own. */
  composite?: boolean;
};

/**
 * A handful of representative outputs, as the design document asks for — enough to cover each way
 * a preview can be drawn, and few enough that a person can look at all of them.
 */
export const PREVIEW_CASES: PreviewCase[] = [
  {
    name: 'planet-webgl-full',
    path: '/planet',
    backend: 'webgl',
    quality: 'full',
    seed: 'goldenplanet',
    forceRings: true,
  },
  {
    name: 'planet-webgl-reduced',
    path: '/planet',
    backend: 'webgl',
    quality: 'reduced',
    seed: 'goldenplanet',
    forceRings: true,
  },
  {
    name: 'planet-canvas2d-full',
    path: '/planet',
    backend: 'canvas2d',
    quality: 'full',
    seed: 'goldenplanet',
    forceRings: true,
  },
  {
    name: 'star-webgl-full',
    path: '/star-system',
    backend: 'webgl',
    quality: 'full',
    seed: 'goldensystem',
    nth: 1,
  },
  {
    name: 'system-webgl-full',
    path: '/star-system',
    backend: 'webgl',
    quality: 'full',
    seed: 'goldensystem',
    composite: true,
  },
];

const PREVIEW_IMAGE_SELECTOR = 'img[alt$="image"], img[alt*="composite"]';

/**
 * Writes the renderer preference before any page script runs, so the first render already uses it.
 * Setting it afterwards would leave the first picture drawn on whatever the probe decided.
 */
export async function pinRendererDecision(
  page: Page,
  backend: PreviewBackend,
  quality: PreviewQuality,
): Promise<void> {
  await page.addInitScript(
    ([backendOverride, qualityOverride]) => {
      localStorage.setItem(
        'ironarachne.rendererPreference',
        JSON.stringify({ backendOverride, qualityOverride }),
      );
    },
    [backend, quality],
  );
}

/** Opens a case's page with everything pinned, generates, and returns the image to look at. */
export async function openPinnedPreview(page: Page, testCase: PreviewCase): Promise<Locator> {
  await pinRendererDecision(page, testCase.backend, testCase.quality);
  await page.goto(testCase.path, { waitUntil: 'load' });

  await page.locator('input#seed').fill(testCase.seed);
  await page.locator('input#lockSeed').check();
  if (testCase.forceRings) {
    await page.locator('input#forceRings').check();
  }
  await page.getByRole('button', { name: /^Generate$/i }).click();

  const image = page.locator(PREVIEW_IMAGE_SELECTOR).nth(testCase.nth ?? 0);
  await image.scrollIntoViewIfNeeded();
  await waitForDecodedImage(image);
  return image;
}

/** An `<img>` with a `src` is not yet an `<img>` with pixels. */
async function waitForDecodedImage(image: Locator): Promise<void> {
  await image.evaluate(async (element: HTMLImageElement) => {
    if (element.src === '') throw new Error('preview image has no src');
    await element.decode();
  });
}

export type ImageStats = {
  width: number;
  height: number;
  /** Quantized to 5 bits a channel, so noise does not read as detail. */
  distinctColors: number;
  meanLuminance: number;
  maxLuminance: number;
  /** The middle third of the image, where a single body sits. */
  centerMeanLuminance: number;
  /** The four corners, which are sky in every case here. */
  cornerMeanLuminance: number;
  /** Where the brightest pixels are, as a fraction of the image. Centre is 0.5, 0.5. */
  brightCentroidX: number;
  brightCentroidY: number;
  /** Mean luminance of each of twelve vertical bands, for the multi-body strip. */
  bandLuminance: number[];
};

/**
 * Measures the image in the browser, from the `<img>` itself.
 *
 * Deliberately not a screenshot: this is the renderer's own output, without the page's compositing,
 * scaling or scrollbars in the way.
 */
export async function readImageStats(image: Locator): Promise<ImageStats> {
  return image.evaluate((element: HTMLImageElement) => {
    const width = element.naturalWidth;
    const height = element.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error('no 2D context to measure with');
    ctx.drawImage(element, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);

    const luminanceAt = (index: number) =>
      (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) / 255;

    const colors = new Set<number>();
    const bandCount = 12;
    const bandTotals = new Array<number>(bandCount).fill(0);
    const bandCounts = new Array<number>(bandCount).fill(0);

    let total = 0;
    let max = 0;
    let centerTotal = 0;
    let centerCount = 0;
    let cornerTotal = 0;
    let cornerCount = 0;
    let brightWeight = 0;
    let brightX = 0;
    let brightY = 0;

    const cornerW = Math.max(1, Math.round(width * 0.08));
    const cornerH = Math.max(1, Math.round(height * 0.08));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const luminance = luminanceAt(index);
        total += luminance;
        if (luminance > max) max = luminance;

        colors.add(
          ((data[index] >> 3) << 10) | ((data[index + 1] >> 3) << 5) | (data[index + 2] >> 3),
        );

        const band = Math.min(bandCount - 1, Math.floor((x / width) * bandCount));
        bandTotals[band] += luminance;
        bandCounts[band] += 1;

        const inCenterX = x > width / 3 && x < (width * 2) / 3;
        const inCenterY = y > height / 3 && y < (height * 2) / 3;
        if (inCenterX && inCenterY) {
          centerTotal += luminance;
          centerCount += 1;
        }

        const inCorner =
          (x < cornerW || x >= width - cornerW) && (y < cornerH || y >= height - cornerH);
        if (inCorner) {
          cornerTotal += luminance;
          cornerCount += 1;
        }

        // Weighting by luminance puts the centroid where the light is, without a threshold to tune.
        brightWeight += luminance;
        brightX += x * luminance;
        brightY += y * luminance;
      }
    }

    const pixels = width * height;
    return {
      width,
      height,
      distinctColors: colors.size,
      meanLuminance: total / pixels,
      maxLuminance: max,
      centerMeanLuminance: centerTotal / Math.max(1, centerCount),
      cornerMeanLuminance: cornerTotal / Math.max(1, cornerCount),
      brightCentroidX: brightWeight === 0 ? 0.5 : brightX / brightWeight / width,
      brightCentroidY: brightWeight === 0 ? 0.5 : brightY / brightWeight / height,
      bandLuminance: bandTotals.map((sum, index) => sum / Math.max(1, bandCounts[index])),
    };
  });
}
