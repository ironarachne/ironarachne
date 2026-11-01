import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { MOBILE_VIEWPORTS } from './mobile_viewports';
import {
  settlementReferencesFixture,
  settlementGutterFixture,
} from '../test_fixtures/region_settlement_references';

let directory: string;
let sources: Record<string, string>;
test.beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'settlement-references-451-'));
  execFileSync(process.execPath, [
    resolve('node_modules/vite-node/dist/cli.mjs'),
    resolve('scripts/render_region_typography_review.ts'),
    directory,
    'after',
    '--controlled-only',
  ]);
  sources = Object.fromEntries(
    ['settlement-references', 'settlement-gutter'].map((name) => [
      name,
      readFileSync(join(directory, `${name}-after.svg`), 'utf8'),
    ]),
  );
});
test.afterAll(() => rmSync(directory, { recursive: true, force: true }));

for (const [name, fixture] of [
  ['settlement-references', settlementReferencesFixture],
  ['settlement-gutter', settlementGutterFixture],
] as const) {
  for (const width of [1280, ...MOBILE_VIEWPORTS.map(({ width }) => width)]) {
    test(`standalone ${name} keys and index remain usable at ${width}px`, async ({ page }) => {
      const source = sources[name];
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(
        `<style>body{margin:0}svg{display:block;width:100%;height:auto}.window{width:100%;max-height:70vh;overflow:auto}</style><div class="window" tabindex="0" role="region" aria-label="Map window"><div id="zoom">${source}</div></div>`,
      );
      await page.evaluate(() => document.fonts.ready);
      const data = fixture();
      const settlements = data.options.settlements!;
      const errors = await page.evaluate(
        ({ settlements, sites }) => {
          const root = document.querySelector('svg')!;
          const view = root.viewBox.baseVal;
          const labels = [...root.querySelectorAll<SVGTextElement>('text[data-text-box]')];
          const errors: string[] = [];
          const boxes = labels.map((text) =>
            text.getAttribute('data-text-box')!.split(' ').map(Number),
          );
          const markers = [
            ...root.querySelectorAll<SVGGraphicsElement>('[data-settlement-icon]'),
          ].map((icon) => icon.getAttribute('data-icon-bounds')!.split(' ').map(Number));
          const panel = root
            .querySelector('#title-cartouche')
            ?.getAttribute('data-reserved-box')
            ?.split(' ')
            .map(Number);
          const overlaps = (a: number[], b: number[]) =>
            a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
          for (const [index, text] of labels.entries()) {
            const box = boxes[index];
            const actual = text.getBBox();
            if (
              actual.width <= 0 ||
              actual.height <= 0 ||
              actual.x < box[0] - 0.01 ||
              actual.y < box[1] - 0.01 ||
              actual.x + actual.width > box[2] + 0.01 ||
              actual.y + actual.height > box[3] + 0.01
            )
              errors.push(`Glyph bounds: ${text.textContent}`);
            if (
              box[0] < view.x ||
              box[1] < view.y ||
              box[2] > view.x + view.width ||
              box[3] > view.y + view.height
            )
              errors.push(`Clipped text: ${text.textContent}`);
            if (markers.some((marker) => overlaps(box, marker)))
              errors.push(`Marker collision: ${text.textContent}`);
            if (
              panel &&
              text.getAttribute('data-map-name') !== 'The Woods of Belvorn' &&
              overlaps(box, panel)
            )
              errors.push('Cartouche collision');
            for (let j = index + 1; j < boxes.length; j++)
              if (overlaps(box, boxes[j])) errors.push('Text reservations overlap');
          }
          for (const settlement of settlements) {
            const key = labels.find((text) => {
              const group = text.closest('[data-settlement-key]');
              return group?.getAttribute('data-feature-id') === settlement.id;
            });
            const rows = labels.filter(
              (text) =>
                text.closest('[data-settlement-index]')?.getAttribute('data-feature-id') ===
                settlement.id,
            );
            if (!key || rows.length < 2) {
              errors.push(`Missing reference: ${settlement.id}`);
              continue;
            }
            const number = key
              .closest('[data-settlement-key]')!
              .getAttribute('data-settlement-key');
            if (key.textContent !== number || rows[0].textContent !== number)
              errors.push('Ambiguous key');
            if (
              rows
                .slice(1)
                .map((text) => text.textContent)
                .join('') !== settlement.name
            )
              errors.push(`Authored name lost: ${settlement.id}`);
            for (const row of rows)
              if (
                row.closest('[data-settlement-index]')!.getAttribute('data-settlement-name') !==
                settlement.name
              )
                errors.push('Saved name mismatch');
          }
          for (const leader of root.querySelectorAll('[data-settlement-leader]')) {
            const settlement = settlements.find(
              (entry) => entry.id === leader.getAttribute('data-feature-id'),
            )!;
            const site = sites.find((node) => node.id === settlement.mapNodeId)!.center;
            const coordinates = leader
              .getAttribute('d')!
              .match(/-?[\d.]+/g)!
              .map(Number);
            if (coordinates.at(-2) !== site.x || coordinates.at(-1) !== site.y)
              errors.push('Leader changes saved site');
          }
          if (document.documentElement.scrollWidth > innerWidth) errors.push('Page overflow');
          return errors;
        },
        { settlements, sites: data.map.nodes },
      );
      expect(errors).toEqual([]);
      await page.locator('.window').evaluate((element) => {
        element.style.maxHeight = 'none';
      });
      await page
        .locator('svg')
        .screenshot({ path: test.info().outputPath(`settlement-index-${width}.png`) });

      await page.locator('.window').evaluate((element) => {
        element.style.maxHeight = '70vh';
      });

      // The same SVG must survive being exported and loaded as an image, without app interaction.
      const imageErrors = await page.evaluate(async (source) => {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let y = 0; y < canvas.height; y++)
          for (let x = 0; x < canvas.width; x++) {
            if (x > 2 && y > 2 && x < canvas.width - 3 && y < canvas.height - 3) continue;
            const i = (y * canvas.width + x) * 4;
            if (pixels[i + 3] < 250 || Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 150)
              return ['Export loses its parchment rim'];
          }
        return [];
      }, source);
      expect(imageErrors).toEqual([]);
      await page.locator('#zoom').evaluate((element) => {
        element.style.width = '400%';
      });
      const viewport = page.getByRole('region', { name: 'Map window' });
      // Zoom creates an intentionally scrollable map window without overflowing the page.
      await expect(page.locator('.window')).toHaveJSProperty(
        'scrollWidth',
        await page.locator('#zoom').evaluate((element) => element.clientWidth),
      );
      await page.locator('.window').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
        element.scrollLeft = element.scrollWidth;
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      expect(await viewport.count()).toBe(1);
    });
  }
}
