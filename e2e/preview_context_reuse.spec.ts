import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { pinRendererDecision } from './preview_fixtures';

/**
 * The regression test for #135: a session that changes a renderer override again and again must
 * still be drawing with WebGL at the end of it, and must not have asked the browser for a fresh GL
 * context per preview image along the way.
 *
 * This has to be an e2e test. A real context is the whole point — the bug was that contexts were
 * created and never released until the browser reclaimed them, which nothing without a browser can
 * observe — and it is exactly the gap the other preview fixtures leave: they pin an override into
 * `localStorage` and *then* navigate, one fresh page per case, so nothing in the suite ever changed
 * an override in a live session or accumulated more than a page's worth of renders.
 *
 * `/star-system` is the page that surfaces it fastest, because one rebuild renders the composite,
 * every star and every planet.
 */
const PLANET_COUNT = 8;
const DETAIL_CHANGES = 10;

/**
 * Two per change is the ceiling the fix implies: the probe takes a context and hands it straight
 * back on every re-resolve, and the first visit to a detail tier builds that tier's renderer.
 * Under the leak it was one per preview image — ten a change here, and over a hundred by the end.
 */
const CONTEXTS_PER_DETAIL_CHANGE = 2;

type ContextCounter = { created: number };
type CountingWindow = Window & { __webglContexts?: ContextCounter };

/** Counts every GL context this page asks for, installed before any page script runs. */
async function countWebGLContexts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const counter = { created: 0 };
    (window as Window & { __webglContexts?: { created: number } }).__webglContexts = counter;

    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      if (args[0] === 'webgl' || args[0] === 'webgl2') counter.created += 1;
      return original.apply(this, args);
    } as HTMLCanvasElement['getContext'];
  });
}

function readWebGLContextCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as CountingWindow).__webglContexts?.created ?? 0);
}

test('changing the detail override again and again keeps WebGL and its contexts', async ({
  page,
}) => {
  test.setTimeout(180_000);

  await countWebGLContexts(page);
  await pinRendererDecision(page, 'webgl', 'full');
  await page.goto('/star-system', { waitUntil: 'load' });

  await page.locator('input#seed').fill('contextreuse');
  await page.locator('input#lockSeed').check();
  await page.locator('select#planetCountControl').selectOption(String(PLANET_COUNT));
  await page.getByRole('button', { name: /^Generate$/i }).click();

  // Not just "WebGL": the fallback line says "Canvas 2D … because the WebGL context was lost", so
  // matching the word alone would pass on the very failure this test exists for.
  const status = page.locator('p.renderer-status');
  await expect(status).toContainText(/Drawing previews with WebGL at/);

  const detail = page.locator('select#rendererQuality');
  const afterFirstRender = await readWebGLContextCount(page);

  for (let change = 0; change < DETAIL_CHANGES; change++) {
    const quality = change % 2 === 0 ? 'reduced' : 'full';
    await detail.selectOption(quality);
    // The status line is rewritten from the resolved decision after each change, so waiting for it
    // to say the new tier is waiting for the rebuild that change triggered.
    await expect(status).toContainText(`${quality} detail`);
  }

  // The failure this guards: the browser reclaims the oldest of a hundred-odd leaked contexts,
  // fires `webglcontextlost` on a canvas whose picture was captured long ago, and the site reads
  // that as proof this machine cannot run WebGL.
  await expect(status).toContainText(/Drawing previews with WebGL at/);

  const created = (await readWebGLContextCount(page)) - afterFirstRender;
  expect(created).toBeLessThanOrEqual(DETAIL_CHANGES * CONTEXTS_PER_DETAIL_CHANGE);

  // And the previews are still previews: a bounded context count is easy to reach by drawing
  // nothing at all.
  const sources = await page
    .locator('img[alt$="image"]')
    .evaluateAll((elements) => elements.map((element) => (element as HTMLImageElement).src));

  expect(sources.length).toBeGreaterThanOrEqual(PLANET_COUNT + 1);
  for (const source of sources) {
    expect(source).toMatch(/^data:image\/png;base64,/);
  }
});
