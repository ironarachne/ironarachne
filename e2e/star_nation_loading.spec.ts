import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

const PREVIEW_STATUS = 'Generating the home system image…';

type FrameGateWindow = Window & {
  holdAnimationFramesForTest?: () => void;
  releaseAnimationFramesForTest?: () => void;
};

/** Hold the first paint boundary until the test has observed the nation and pending preview. */
async function gateAnimationFrames(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const requestFrame = window.requestAnimationFrame.bind(window);
    const cancelFrame = window.cancelAnimationFrame.bind(window);
    const waiting = new Map<number, FrameRequestCallback>();
    let nextId = 1;

    (window as FrameGateWindow).holdAnimationFramesForTest = () => {
      window.requestAnimationFrame = (callback) => {
        const id = nextId;
        nextId += 1;
        waiting.set(id, callback);
        return id;
      };
      window.cancelAnimationFrame = (id) => {
        waiting.delete(id);
      };
    };
    (window as FrameGateWindow).releaseAnimationFramesForTest = () => {
      window.requestAnimationFrame = requestFrame;
      window.cancelAnimationFrame = cancelFrame;
      for (const callback of waiting.values()) {
        requestFrame(callback);
      }
      waiting.clear();
    };
    (window as FrameGateWindow).holdAnimationFramesForTest();
  });
}

async function holdAnimationFrames(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as FrameGateWindow).holdAnimationFramesForTest?.();
  });
}

async function releaseAnimationFrames(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as FrameGateWindow).releaseAnimationFramesForTest?.();
  });
}

function previewStatus(page: Page) {
  return page.getByRole('status').filter({ hasText: PREVIEW_STATUS });
}

test.describe('star nation preview generation', () => {
  test.beforeEach(async ({ page }) => {
    await gateAnimationFrames(page);
  });

  test('shows the nation before its image on the standalone route', async ({ page }) => {
    await page.goto('/star-nation', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.nation h2')).toBeVisible();
    await expect(previewStatus(page)).toBeVisible();
    await expect(page.locator('.image-container-system img')).toHaveCount(0);

    await releaseAnimationFrames(page);
    await expect(page.locator('.image-container-system img')).toBeVisible({ timeout: 30_000 });
    await expect(previewStatus(page)).toHaveCount(0);

    const firstNation = await page.locator('.nation h2').innerText();
    await page.getByLabel('Seed', { exact: true }).fill('deferred-preview-test');
    await page.getByLabel('Lock Seed').check();
    await holdAnimationFrames(page);
    await page
      .getByRole('button', { name: 'Generate', exact: true })
      .evaluate((button: HTMLButtonElement) => button.click());

    await expect(page.locator('.nation h2')).not.toHaveText(firstNation);
    await expect(previewStatus(page)).toBeVisible();
    await expect(page.locator('.image-container-system img')).toHaveCount(0);

    await releaseAnimationFrames(page);
    await expect(page.locator('.image-container-system img')).toBeVisible({ timeout: 30_000 });
    await expect(previewStatus(page)).toHaveCount(0);
  });

  test('shows the nation before its image in the workshop panel', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Star Nation/ })
      .click();

    const panel = page.locator('section.workshop-panel');
    await expect(panel.locator('.nation h2')).toBeVisible();
    await expect(panel.getByRole('status').filter({ hasText: PREVIEW_STATUS })).toBeVisible();
    await expect(panel.locator('.image-container-system img')).toHaveCount(0);

    await releaseAnimationFrames(page);
    await expect(panel.locator('.image-container-system img')).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByRole('status').filter({ hasText: PREVIEW_STATUS })).toHaveCount(0);
  });
});
