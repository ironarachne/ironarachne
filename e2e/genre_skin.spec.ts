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

/**
 * What a skin paints into the 1px ring `--panel-edge` fills, measured against the box it painted on.
 *
 * docs/visual-design.md, "A corner mark is not a keyline, and the register knows the difference":
 * a keyline running the whole perimeter is held to a luminance register, and a mark covering under a
 * fifth of it may go to full palette brightness instead. Which of the two a skin has written is a
 * relationship between its layers and the rendered size of the panel, so it is only answerable here.
 *
 * A layer at a corner paints along both edges that meet there, so its contribution is its width plus
 * its height — 24 + 24 for a square gilt block, 18 + 1 for a bracket arm.
 *
 * Only the image-bearing layers count. `background: <gradient>, <gradient>, <colour>` is three
 * layers, not two with a colour: the last one carries the fill and reports `none`, `repeat` and
 * `auto auto`, and counting it would fail a skin for the hairline it wears everywhere the marks are
 * not. Both skins that paint marks put their images first, which is the order this relies on.
 */
async function cornerMarks(
  page: Page,
): Promise<{ layers: number; repeats: string[]; painted: number; perimeter: number }> {
  return page
    .locator('.panel')
    .first()
    .evaluate((element) => {
      const computed = getComputedStyle(element);
      const { width, height } = element.getBoundingClientRect();
      // Counted by gradient rather than by comma: each layer's own `rgb(…)` stops carry commas of
      // their own, so splitting the string counts sixteen of eight.
      const layers = (computed.backgroundImage.match(/linear-gradient\(/g) ?? []).length;

      const painted = computed.backgroundSize
        .split(',')
        .slice(0, layers)
        .map((size) =>
          size
            .trim()
            .split(/\s+/)
            .map(Number.parseFloat)
            .reduce((total, side) => total + side, 0),
        )
        .reduce((total, layer) => total + layer, 0);

      return {
        layers,
        repeats: computed.backgroundRepeat
          .split(',')
          .slice(0, layers)
          .map((value) => value.trim()),
        painted,
        perimeter: 2 * (width + height),
      };
    });
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

/** The rendered surface, clip and box of the first panel liner on the page. */
async function panelShape(
  page: Page,
): Promise<{ surface: [number, number, number]; clip: string; box: string }> {
  const surface = await panelSurface(page);
  const rest = await page
    .locator('.panel')
    .first()
    .evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { clip: getComputedStyle(element).clipPath, box: `${width}x${height}` };
    });

  return { surface, ...rest };
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

  test('gilds the two corners its shape cuts, and stays a corner mark', async ({ page }) => {
    // #156: the device fantasy went without while the other two skins gained one. Gold is luminance
    // 0.40, which the register forbids on a keyline that runs the whole perimeter — so this is only
    // permitted while it stays a mark, and that is a measurement against the rendered box.
    await openProject(page);
    await setGenre(page, 'fantasy');

    const marks = await cornerMarks(page);

    // Two blocks, at the two corners the shield's foot cuts. The tan hairline the rest of the
    // perimeter wears is a background *colour*, so it is not one of these layers.
    expect(marks.layers, 'the gilt is not painted at the corners').toBe(2);
    expect(marks.repeats, 'the gilt repeats, which would make it a keyline').toEqual([
      'no-repeat',
      'no-repeat',
    ]);

    expect(marks.painted, 'the gilt covers more than a fifth of the perimeter').toBeLessThanOrEqual(
      marks.perimeter / 5,
    );
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

test.describe('the sci-fi skin', () => {
  test('cools the panel without lightening it, and takes a shape of its own', async ({ page }) => {
    await openProject(page);
    const base = await panelShape(page);

    await setGenre(page, 'scifi');
    const scifi = await panelShape(page);

    expect(scifi.surface, 'the skin did not reach the panel surface').not.toEqual(base.surface);

    // It reads cool: more blue than red, the mirror of the fantasy assertion. Without it, "no
    // lighter" could be satisfied by a skin that simply went darker and dressed nothing.
    expect(scifi.surface[2], 'the sci-fi surface is not cool').toBeGreaterThan(scifi.surface[0]);

    expect(
      luminance(scifi.surface),
      'a sci-fi panel is lighter than a base panel',
    ).toBeLessThanOrEqual(luminance(base.surface));

    // The corner: a machined plate, chamfered on all four rather than the base's diagonal pair.
    // docs/visual-design.md, "The four shapes, and why each is its genre's".
    expect(scifi.clip, 'the skin did not reach the corner').not.toEqual(base.clip);

    // And the whole claim the corner rests on: a `clip-path` paints, it does not lay out. Two
    // panels wearing different shapes are the same box, which is what decision 2 protects when it
    // keeps geometry away from a skin — and what a skin reaching past the four depths would break.
    expect(scifi.box, 'a skinned panel is not the size of a base panel').toEqual(base.box);
  });

  test('keeps its texture when motion is switched off', async ({ page }) => {
    // The sci-fi surface carries two layers and only one of them moves: the scan is the ambient
    // effect and goes under reduced motion, where the scanlines are *texture* and stay. This is
    // the assertion that the genre survives the switch rather than falling back to a plain fill.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openProject(page);
    await setGenre(page, 'scifi');

    const paint = await page
      .locator('.panel__field')
      .first()
      .evaluate((element) => ({
        image: getComputedStyle(element).backgroundImage,
        animation: getComputedStyle(element).animationName,
      }));

    expect(paint.animation, 'the scan still runs under reduced motion').toBe('none');
    expect(paint.image, 'the scanlines went with the scan').toContain('repeating-linear-gradient');
  });
});

test.describe('the cyberpunk skin', () => {
  test('marks the corners rather than outlining the panel', async ({ page }) => {
    await openProject(page);
    const base = await panelShape(page);

    await setGenre(page, 'cyberpunk');
    const cyberpunk = await panelShape(page);

    expect(cyberpunk.surface, 'the skin did not reach the panel surface').not.toEqual(base.surface);

    // Darker than a base panel, which the skin rule requires, and darker than the page, which is
    // what "inset black" means: this genre's panels are cut into the page rather than raised off
    // it. docs/visual-design.md, "The surface gives up its separation".
    expect(
      luminance(cyberpunk.surface),
      'a cyberpunk panel is lighter than a base panel',
    ).toBeLessThanOrEqual(luminance(base.surface));

    // Four knife edges, which is the shape it revised #120's reserved slash into. The clip is
    // still a polygon — at zero depth it is the panel's own rectangle, so every coordinate is a
    // corner of the box and nothing is cut off.
    expect(cyberpunk.clip, 'the skin did not reach the corner').not.toEqual(base.clip);
    expect(cyberpunk.clip, 'the corner is not square').toMatch(
      /^polygon\((?:\s*(?:0px|100%) (?:0px|100%),?)+\)$/,
    );
    expect(cyberpunk.box, 'a skinned panel is not the size of a base panel').toEqual(base.box);
  });

  test('earns its brightness by covering a fifth of the perimeter at most', async ({ page }) => {
    // The rule that lets this skin wear undiluted acid and magenta where the register would
    // otherwise forbid them: a corner mark is not a keyline.
    await openProject(page);
    await setGenre(page, 'cyberpunk');

    const marks = await cornerMarks(page);

    // Eight layers: two arms at each of four corners.
    expect(marks.layers, 'the keyline is not painted as corner marks').toBe(8);

    // Every layer, not just some: one repeating layer would run an arm the length of the panel and
    // make the whole argument for full brightness untrue.
    expect(marks.repeats, 'a mark repeats, which would make it a hairline').toEqual(
      Array.from({ length: 8 }, () => 'no-repeat'),
    );

    expect(marks.painted, 'the marks cover more than a fifth of the perimeter').toBeLessThanOrEqual(
      marks.perimeter / 5,
    );
  });

  test('keeps a control readable on a surface that gave up its fill', async ({ page }) => {
    // The one thing about this skin a later change could quietly break. A cyberpunk panel is 1.05:1
    // against `--surface-inset`, so a control's fill no longer separates it from the panel — what
    // says "sunken" is `--sink` and the border, both base-system and both untouchable by a skin.
    await openProject(page);
    await setGenre(page, 'cyberpunk');
    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Rename' }).click();

    const field = await editingCard(page)
      .getByLabel('Genre')
      .evaluate((element) => {
        const computed = getComputedStyle(element);
        return { shadow: computed.boxShadow, border: computed.borderTopWidth };
      });

    expect(field.shadow, 'the control lost the shadow that says it is sunken').not.toBe('none');
    expect(Number.parseFloat(field.border), 'the control lost its border').toBeGreaterThan(0);
  });

  test('keeps its marks when motion is switched off', async ({ page }) => {
    // The flicker is the whole reason #121 needed deciding, and the reduced-motion state is where
    // that decision shows: the fault goes, the marks stay, and the genre survives the switch.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openProject(page);
    await setGenre(page, 'cyberpunk');

    const paint = await page
      .locator('.panel')
      .first()
      .evaluate((element) => ({
        animation: getComputedStyle(element).animationName,
        image: getComputedStyle(element).backgroundImage,
      }));

    expect(paint.animation, 'the ballast still runs under reduced motion').toBe('none');
    expect(paint.image, 'the corner marks went with the fault').toContain('linear-gradient');
  });
});
