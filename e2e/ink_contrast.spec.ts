import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';

/**
 * Every ink role clears its contrast floor on the surface it is actually used on.
 *
 * `--ink-faint` sat below 4.5:1 on a panel from the day it was defined until #149, while the
 * document recorded 4.8:1 — a true number about `--surface-page`, and the wrong question, because
 * a label is never on the page. A ratio is a fact about a foreground *and* a background, and half
 * of it was missing.
 *
 * Computed in a browser rather than from the source: the roles are `color-mix()` expressions, so
 * what they resolve to is the browser's answer and not something a test should reimplement. This
 * reads what actually renders.
 *
 * `--surface-raised` is the worst case for the whole app, and that is guaranteed rather than
 * assumed — a skin may shift its panel surface's hue but never raise its luminance above this one
 * (docs/visual-design.md, "A skin's surface is never lighter than the base's"), and every other
 * surface in the app is darker. A role that clears its floor here clears it everywhere, in every
 * present and future genre.
 */

/** Text that has to be readable, and the floor each is held to. */
const INK_ROLES = [
  { token: '--ink', floor: 4.5 },
  { token: '--ink-muted', floor: 4.5 },
  { token: '--ink-faint', floor: 4.5 },
] as const;

/**
 * Resolve a custom property to an actual colour by letting the browser paint it, then read the
 * relative luminance back. `getPropertyValue` would hand back the unresolved `color-mix(...)`.
 */
async function contrast(page: Page, foreground: string, background: string): Promise<number> {
  return page.evaluate(
    ([fg, bg]) => {
      const resolve = (value: string): [number, number, number] => {
        const probe = document.createElement('span');
        probe.style.color = value;
        document.body.append(probe);
        const computed = getComputedStyle(probe).color;
        probe.remove();

        const parts = computed.match(/[\d.]+/g);
        if (parts === null) {
          throw new Error(`could not read a colour from ${value} (got ${computed})`);
        }
        // `rgb()` gives 0-255; `color(srgb ...)`, which is what a `color-mix` computes to, gives
        // 0-1. Both are sRGB, so the only difference is the scale.
        const channels = parts.slice(0, 3).map(Number);
        const scaled = computed.startsWith('color(') ? channels.map((c) => c * 255) : channels;
        return [scaled[0], scaled[1], scaled[2]];
      };

      const luminance = (rgb: [number, number, number]): number => {
        const [r, g, b] = rgb.map((channel) => {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const a = luminance(resolve(fg));
      const b = luminance(resolve(bg));
      const [lighter, darker] = a > b ? [a, b] : [b, a];
      return (lighter + 0.05) / (darker + 0.05);
    },
    [foreground, background],
  );
}

test.describe('the ink roles are readable', () => {
  test('every ink role clears 4.5:1 on a panel', async ({ page }) => {
    await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });

    for (const { token, floor } of INK_ROLES) {
      const ratio = await contrast(page, `var(${token})`, 'var(--surface-raised)');

      expect(ratio, `${token} on --surface-raised`).toBeGreaterThanOrEqual(floor);
    }
  });

  test('the ink ramp keeps three distinguishable steps', async ({ page }) => {
    await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });

    // Raising `--ink-faint` alone would have cleared the floor and left the pair 1.17:1 apart,
    // which is a three-step ramp reading as two. Both roles moved together so this stays true.
    const faintToMuted = await contrast(page, 'var(--ink-faint)', 'var(--ink-muted)');
    const mutedToInk = await contrast(page, 'var(--ink-muted)', 'var(--ink)');

    expect(faintToMuted, '--ink-faint against --ink-muted').toBeGreaterThanOrEqual(1.3);
    expect(mutedToInk, '--ink-muted against --ink').toBeGreaterThanOrEqual(1.3);
  });

  test('the page is the forgiving surface, not the one that matters', async ({ page }) => {
    await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });

    // The premise behind measuring against `--surface-raised`: the page flatters every role, so a
    // ratio taken there says nothing about a label on a panel. If this ever inverts, the reference
    // surface in docs/visual-design.md is wrong and this suite should say so.
    const onPage = await contrast(page, 'var(--ink-faint)', 'var(--surface-page)');
    const onPanel = await contrast(page, 'var(--ink-faint)', 'var(--surface-raised)');

    expect(onPage, 'the page is more forgiving than a panel').toBeGreaterThan(onPanel);
  });
});
