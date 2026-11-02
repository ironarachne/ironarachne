import { expect, test } from '@playwright/test';
import { visitRoute, clickGenerateButton } from './helpers';
import { expectNoHorizontalOverflow, pinGeneratorSeed } from './mobile_layout';

for (const [route, title] of [
  ['/fantasy/settlement', 'Settlement Generator | Iron Arachne'],
  ['/region', 'Region Generator | Iron Arachne'],
]) {
  test(`panorama banners render and fit at desktop and 320px on ${route}`, async ({ page }) => {
    test.slow();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await visitRoute(page, route, { title });
    await pinGeneratorSeed(page, 'panorama-review');
    await clickGenerateButton(page);
    const images = page.locator('img.settlement-panorama');
    await expect(images.first()).toBeVisible({ timeout: 30000 });
    const original = await images.first().getAttribute('src');
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
          )
          .toBe(true);
        const box = await image.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width / box!.height).toBeCloseTo(10 / 3, 1);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await expectNoHorizontalOverflow(page);
    }
    expect(await images.first().getAttribute('src')).toBe(original);
  });
}
