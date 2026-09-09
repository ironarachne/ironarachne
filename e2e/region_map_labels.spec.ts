import { expect, test } from '@playwright/test';
import { visitRoute } from './helpers';

for (const seed of ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']) {
  test(`region map text stays within its reserved bounds: ${seed}`, async ({ page }) => {
    await visitRoute(page, '/region');
    await page.getByLabel('Seed', { exact: true }).fill(seed);
    await page.getByLabel('Lock Seed').check();
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    const map = page.locator('img.region-map');
    await expect(map).toBeVisible();
    const failures = await map.evaluate(async (image: HTMLImageElement, seed) => {
      const source = await (await fetch(image.src)).text();
      const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-10000px;top:0;';
      host.append(document.importNode(svg, true));
      document.body.append(host);
      await document.fonts.ready;
      try {
        const root = host.querySelector('svg')!;
        const view = root.viewBox.baseVal;
        const panel = root.querySelector<SVGRectElement>('#title-cartouche')!;
        const panelBox = panel.getBBox();
        const markers = [
          ...root.querySelectorAll<SVGGraphicsElement>(
            '#map-layers circle[fill="none"], #map-layers text',
          ),
        ].map((marker) => marker.getBBox());
        const labels = [...root.querySelectorAll<SVGTextElement>('text[data-text-box]')];
        const errors: string[] = [];
        if (labels.length < 2) errors.push('Expected a title and settlement labels');
        for (const [index, text] of labels.entries()) {
          const bounds = text.getAttribute('data-text-box')!.split(' ').map(Number);
          const actual = text.getBBox();
          for (const marker of markers) {
            if (
              bounds[0] < marker.x + marker.width &&
              bounds[2] > marker.x &&
              bounds[1] < marker.y + marker.height &&
              bounds[3] > marker.y
            )
              errors.push(`Text overlaps marker: ${text.textContent}`);
          }
          // Actual font bounds must fit the model; a layout assertion alone would miss bad metrics.
          if (
            actual.x < bounds[0] - 0.01 ||
            actual.y < bounds[1] - 0.01 ||
            actual.x + actual.width > bounds[2] + 0.01 ||
            actual.y + actual.height > bounds[3] + 0.01
          )
            errors.push(`Font exceeds reserved bounds: ${text.textContent}`);
          if (
            bounds[0] < view.x - 0.001 ||
            bounds[1] < view.y - 0.001 ||
            bounds[2] > view.x + view.width + 0.001 ||
            bounds[3] > view.y + view.height + 0.001
          )
            errors.push(`Text leaves viewBox: ${text.textContent}`);
          if (
            index < labels.length - 1 &&
            bounds[0] < panelBox.x + panelBox.width &&
            bounds[2] > panelBox.x &&
            bounds[1] < panelBox.y + panelBox.height &&
            bounds[3] > panelBox.y
          )
            errors.push(`Label enters cartouche: ${text.textContent}`);
        }
        const compass = root.querySelector<SVGGraphicsElement>('#map-compass');
        if (['alpha', 'bravo', 'charlie'].includes(seed) && !compass)
          errors.push('Missing compass');
        if (compass) {
          const [minX, minY, maxX, maxY] = compass
            .getAttribute('data-reserved-box')!
            .split(' ')
            .map(Number);
          const overlaps = (box: { x: number; y: number; width: number; height: number }) =>
            minX < box.x + box.width && maxX > box.x && minY < box.y + box.height && maxY > box.y;
          for (const obstacle of [...markers, panelBox, ...labels.map((label) => label.getBBox())])
            if (overlaps(obstacle)) errors.push('Compass overlaps marker or text');
          const rootMatrix = root.getCTM()!.inverse();
          for (const glyph of root.querySelectorAll<SVGGraphicsElement>(
            '#map-layers use[transform]',
          )) {
            const box = glyph.getBBox(),
              matrix = rootMatrix.multiply(glyph.getCTM()!);
            const points = [
              [box.x, box.y],
              [box.x + box.width, box.y],
              [box.x, box.y + box.height],
              [box.x + box.width, box.y + box.height],
            ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
            const left = Math.min(...points.map((point) => point.x)),
              top = Math.min(...points.map((point) => point.y));
            if (
              overlaps({
                x: left,
                y: top,
                width: Math.max(...points.map((point) => point.x)) - left,
                height: Math.max(...points.map((point) => point.y)) - top,
              })
            )
              errors.push('Compass overlaps terrain');
          }
        }
        // Inspect the actual rasterized SVG: clipping and filter overflow must leave a paper rim.
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const rim = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) * 0.01));
        let darkRim = false;
        for (let y = 0; y < canvas.height; y++)
          for (let x = 0; x < canvas.width; x++) {
            if (x >= rim && x < canvas.width - rim && y >= rim && y < canvas.height - rim) continue;
            const index = (y * canvas.width + x) * 4;
            if (Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) < 150) darkRim = true;
          }
        if (darkRim) errors.push('Map ink reaches the outer parchment rim');
        return errors;
      } finally {
        host.remove();
      }
    }, seed);
    expect(failures).toEqual([]);
  });
}
