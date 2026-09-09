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
    const failures = await map.evaluate(async (image: HTMLImageElement) => {
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
            bounds[0] < -0.001 ||
            bounds[1] < -0.001 ||
            bounds[2] > view.width + 0.001 ||
            bounds[3] > view.height + 0.001
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
        return errors;
      } finally {
        host.remove();
      }
    });
    expect(failures).toEqual([]);
  });
}
