import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';

const panels = (page: Page) => page.locator('section.workshop-panel');
const toolBrowser = (page: Page) => page.locator('section.tool-browser');
const sessionLog = (page: Page) => page.locator('section.session-log');
const logEntries = (page: Page) => sessionLog(page).locator('.session-log__entry');

async function openEmptyWorkshop(page: Page): Promise<void> {
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
}

function mountTool(page: Page, label: string | RegExp) {
  return toolBrowser(page).getByRole('button', { name: label }).click();
}

test.describe('scratch', () => {
  test('measures the columns', async ({ page }) => {
    for (const [width, height] of [
      [1920, 1080],
      [1500, 900],
      [1400, 900],
      [1400, 1200],
      [1280, 800],
      [1200, 900],
      [1100, 900],
      [900, 900],
      [700, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await openEmptyWorkshop(page);
      await mountTool(page, /^Settlement/);
      await panels(page).getByRole('button', { name: 'Generate', exact: true }).click();
      await expect(logEntries(page)).toHaveCount(2);
      await page.evaluate(() => window.scrollTo(0, 0));
      const boxes = await page.evaluate(() => {
        const read = (selector: string) => {
          const el = document.querySelector(selector);
          if (el === null) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
        };
        return {
          rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
          layout: read('.workshop__layout'),
          rail: read('.workshop__rail'),
          bench: read('.workshop__bench'),
          log: read('.workshop__log'),
          docWidth: document.documentElement.scrollWidth,
        };
      });
      console.log(`${width}x${height}`, JSON.stringify(boxes));
      await page.screenshot({
        path: `/tmp/claude-1000/-home-ben-Source-ironarachne/e96ac5ed-32ad-4393-9ab1-6af6982fb320/scratchpad/w-${width}x${height}.png`,
      });
    }
  });
});
