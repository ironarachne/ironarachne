import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';
import { editingCard, projectCard, projectsPage } from './projects';

/**
 * A skin dresses a panel without making it less readable.
 *
 * `docs/visual-design.md`, "A skin's surface is never lighter than the base's": a skin may shift
 * its panel surface's hue freely, but its luminance may not rise above `--surface-raised`'s. That
 * rule is why colour roles can measure every ink ratio against `--surface-raised` and treat it as
 * the worst case for the whole app — so this file is what that table rests on.
 *
 * **Everything here reads the rendered panel, not the recipe.** The first version of this suite
 * compared the two token expressions to each other and passed while the skin was reaching nothing
 * at all: `.panel` declared `--panel-surface` on itself, and an element's own declaration beats an
 * inherited one, so every fantasy panel painted slate. That is the same mistake #149 was about —
 * measuring the right idea against the wrong thing — and the fix is to ask the panel.
 */

/** The rendered background of the first panel liner on the page, as sRGB 0-255. */
async function panelSurface(page: Page): Promise<[number, number, number]> {
  return page
    .locator('.panel__field')
    .first()
    .evaluate((element) => {
      const computed = getComputedStyle(element).backgroundColor;
      const parts = (computed.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      // `rgb()` is 0-255; `color(srgb …)`, which a `color-mix` computes to, is 0-1.
      const scaled = computed.startsWith('color(') ? parts.map((c) => c * 255) : parts;
      return [scaled[0], scaled[1], scaled[2]] as [number, number, number];
    });
}

function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** A project with a panel on screen, and a genre that can be changed without a reload. */
async function openProject(page: Page): Promise<void> {
  await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });
  await projectsPage(page).getByLabel('New project').fill('Ashfall');
  await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
  await expect(projectCard(page, 'Ashfall')).toBeVisible();
}

async function setGenre(page: Page, genre: string): Promise<void> {
  await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();
  await editingCard(page).getByLabel('Genre').selectOption(genre);
  await editingCard(page).getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('main.shell__page')).toHaveAttribute('data-genre', genre);
}

test.describe('the fantasy skin', () => {
  test('reaches the panel, warms it, and never lightens it', async ({ page }) => {
    await openProject(page);
    const base = await panelSurface(page);

    await setGenre(page, 'fantasy');
    const fantasy = await panelSurface(page);

    // It reaches the panel at all. This is the assertion the first version of this file lacked,
    // and the skin was inert without it.
    expect(fantasy, 'the skin did not reach the panel surface').not.toEqual(base);

    // It reads warm: more red than blue. Without this, "no lighter" could be satisfied by a skin
    // that simply went darker and dressed nothing.
    expect(fantasy[0], 'the fantasy surface is not warm').toBeGreaterThan(fantasy[2]);

    // And it costs no contrast, which is the rule the colour-roles table depends on.
    expect(luminance(fantasy), 'a fantasy panel is lighter than a base panel').toBeLessThanOrEqual(
      luminance(base),
    );
  });

  test('dresses the work and leaves the app’s own voice alone', async ({ page }) => {
    await openProject(page);
    await setGenre(page, 'fantasy');

    // The bar and the sidebar are the page region's siblings, so the genre cannot reach them.
    const barPaint = await page
      .locator('.top-bar')
      .evaluate((element) => getComputedStyle(element).backgroundImage);

    expect(barPaint, 'the skin reached the top bar').toBe('none');
    await expect(page.locator('.top-bar')).not.toHaveAttribute('data-genre');
    await expect(page.locator('.sidebar')).not.toHaveAttribute('data-genre');
  });

  test('puts its one effect on the surface rather than on the type', async ({ page }) => {
    await openProject(page);
    await setGenre(page, 'fantasy');

    // The genre moved off the type and onto the panel: the sheen is a background layer on the
    // liner, and the heading it used to animate is a flat colour.
    const panelPaint = await page
      .locator('.panel__field')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundImage);

    expect(panelPaint, 'the ambient effect is not on the panel surface').toContain('gradient');

    // The page title is the element the old skin painted hardest: a gold foil gradient clipped to
    // the text, animated on an 8s loop. It is flat ink now, and it is outside a panel besides.
    const headingPaint = await page
      .locator('h1')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundImage);

    expect(headingPaint, 'the skin is still painting the type').toBe('none');
  });
});
