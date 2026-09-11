import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

const INITIAL_STATUS = 'Generating the initial star system…';

type FrameGateWindow = Window & { releaseAnimationFramesForTest?: () => void };

/** Hold the first paint boundary until the test has observed the pending state. */
async function gateAnimationFrames(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const requestFrame = window.requestAnimationFrame.bind(window);
    const cancelFrame = window.cancelAnimationFrame.bind(window);
    const waiting = new Map<number, FrameRequestCallback>();
    let nextId = 1;

    window.requestAnimationFrame = (callback) => {
      const id = nextId;
      nextId += 1;
      waiting.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      waiting.delete(id);
    };
    (window as FrameGateWindow).releaseAnimationFramesForTest = () => {
      window.requestAnimationFrame = requestFrame;
      window.cancelAnimationFrame = cancelFrame;
      for (const callback of waiting.values()) {
        requestFrame(callback);
      }
      waiting.clear();
    };
  });
}

async function releaseAnimationFrames(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as FrameGateWindow).releaseAnimationFramesForTest?.();
  });
}

function initialStatus(page: Page) {
  return page.getByRole('status').filter({ hasText: INITIAL_STATUS });
}

test.describe('initial star system generation', () => {
  test.beforeEach(async ({ page }) => {
    await gateAnimationFrames(page);
  });

  test('announces pending work and replaces it with a system on the standalone route', async ({
    page,
  }) => {
    await page.goto('/star-system', { waitUntil: 'domcontentloaded' });

    await expect(initialStatus(page)).toBeVisible();
    await releaseAnimationFrames(page);
    await expect(page.locator('article.media-banner').first()).toBeVisible({ timeout: 30_000 });
    await expect(initialStatus(page)).toHaveCount(0);
  });

  test('announces pending work and replaces it with a system in the workshop panel', async ({
    page,
  }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page
      .locator('section.tool-browser')
      .getByRole('button', { name: /^Star System/ })
      .click();

    const panel = page.locator('section.workshop-panel');
    await expect(panel.getByRole('status').filter({ hasText: INITIAL_STATUS })).toBeVisible();
    await releaseAnimationFrames(page);
    await expect(panel.locator('article.media-banner').first()).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByRole('status').filter({ hasText: INITIAL_STATUS })).toHaveCount(0);
  });
});
