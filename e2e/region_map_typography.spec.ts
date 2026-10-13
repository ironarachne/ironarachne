import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

let directory: string;
test.beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'region-typography-e2e-'));
  execFileSync(process.execPath, [
    resolve('node_modules/vite-node/dist/cli.mjs'),
    resolve('scripts/render_region_typography_review.ts'),
    directory,
    'after',
    '--controlled-only',
  ]);
});
test.afterAll(() => rmSync(directory, { recursive: true, force: true }));

for (const name of ['places', 'river', 'legacy-river', 'range', 'forest']) {
  test(`${name} typography has real glyph bounds inside its reservations`, async ({ page }) => {
    const source = readFileSync(join(directory, `${name}-after.svg`), 'utf8');
    await page.setContent(source);
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const labels = [...document.querySelectorAll<SVGTextElement>('text[data-text-box]')];
      const errors: string[] = [];
      const scroll = document.querySelector<SVGGraphicsElement>('#title-cartouche')!;
      const [left, top, right, bottom] = scroll
        .getAttribute('data-reserved-box')!
        .split(' ')
        .map(Number);
      const panel = scroll.getBBox();
      if (
        panel.x < left - 0.01 ||
        panel.y < top - 0.01 ||
        panel.x + panel.width > right + 0.01 ||
        panel.y + panel.height > bottom + 0.01
      )
        errors.push('Scroll exceeds its footprint');

      for (const label of labels) {
        const [minX, minY, maxX, maxY] = label
          .getAttribute('data-text-box')!
          .split(' ')
          .map(Number);
        const actual = label.getBBox();
        if (
          actual.width <= 0 ||
          actual.height <= 0 ||
          actual.x < minX - 0.01 ||
          actual.y < minY - 0.01 ||
          actual.x + actual.width > maxX + 0.01 ||
          actual.y + actual.height > maxY + 0.01
        )
          errors.push(`Glyph exceeds bounds: ${label.getAttribute('data-map-name')}`);
        for (const other of labels) {
          if (other === label) continue;
          const [a, b, c, d] = other.getAttribute('data-text-box')!.split(' ').map(Number);
          if (minX < c && maxX > a && minY < d && maxY > b)
            errors.push('Label reservations overlap');
        }
      }
      return {
        errors,
        names: labels.map((label) => label.getAttribute('data-map-name')),
        curves: labels.filter((label) => label.querySelector('tspan[rotate]')).length,
      };
    });
    expect(result.errors).toEqual([]);
    expect(result.curves).toBeGreaterThan(0);
    expect(result.names).toContain(
      name === 'places'
        ? 'Greenwood'
        : name === 'range'
          ? 'Greyback Mountains'
          : name === 'forest'
            ? 'Greywood'
            : 'Aster River',
    );
    if (name === 'places') {
      const gap = await page
        .locator('text[data-text-box][data-map-name="High Haven"]')
        .evaluate((text: SVGTextElement) => {
          const before = text.getExtentOfChar(3),
            after = text.getExtentOfChar(5);
          return after.x - before.x - before.width;
        });
      expect(gap).toBeGreaterThan(0.15);

      await expect(page.locator('text[data-text-box][data-map-name="Willow"]')).toHaveAttribute(
        'data-map-case',
        'smallCaps',
      );
      await expect(page.locator('text[data-text-box][data-map-name="Lowby"]')).toHaveAttribute(
        'data-map-case',
        'normal',
      );
      await expect(
        page.locator('text[data-text-box][data-map-name="The Old Mill"]'),
      ).toHaveAttribute('font-style', 'italic');
    }
    // The same SVG must survive the image/canvas path used for raster output.
    const pixels = await page.evaluate(async (svg) => {
      const render = async (source: string) => {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const parsedSvg = new DOMParser().parseFromString(svg, 'image/svg+xml');
      for (const text of parsedSvg.querySelectorAll('text')) {
        if (text.querySelector('tspan[rotate]')) text.remove();
      }
      const withCurves = await render(svg);
      const withoutCurves = await render(new XMLSerializer().serializeToString(parsedSvg));
      return withCurves.reduce(
        (count, value, index) => count + (Math.abs(value - withoutCurves[index]) > 10 ? 1 : 0),
        0,
      );
    }, source);
    expect(pixels).toBeGreaterThan(100);
    await page.locator('svg').screenshot({ path: test.info().outputPath(`${name}.png`) });
  });
}
