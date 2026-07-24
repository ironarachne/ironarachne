import { expect, type Page } from '@playwright/test';

/** Sub-pixel rounding in layout means an exact comparison produces false failures. */
const OVERFLOW_TOLERANCE_PX = 1;

/**
 * Most generators seed themselves from a random string on mount, so the content
 * on screen — and therefore how wide it is — differs run to run. Pinning the
 * seed makes a layout baseline mean something: the same words, at the same
 * widths, every time.
 */
const BASELINE_SEED = 'mobilebaseline';

/**
 * Fixes the generated content, if this page exposes the shared seed control.
 * Returns whether a seed was found to pin; pages without one still generate
 * randomly, so their layout is only spot-checked rather than reproduced.
 */
export async function pinGeneratorSeed(page: Page, seed = BASELINE_SEED): Promise<boolean> {
  const seedInput = page.locator('input#seed');
  if ((await seedInput.count()) === 0) {
    return false;
  }

  await seedInput.fill(seed);

  const lockSeed = page.locator('input#lockSeed');
  if ((await lockSeed.count()) > 0) {
    await lockSeed.check();
  }

  return true;
}

export type LayoutOffender = {
  description: string;
  left: number;
  right: number;
  width: number;
};

export type HorizontalOverflowReport = {
  viewportWidth: number;
  documentScrollWidth: number;
  offenders: LayoutOffender[];
};

/**
 * Reports elements that extend past either edge of the viewport, ignoring any
 * whose ancestor clips or scrolls horizontally on purpose (a deliberately
 * scrollable table, for instance, is not a layout bug).
 *
 * Only the innermost offenders are returned: when a wide child forces a chain
 * of ancestors wide, the child is the thing worth naming.
 */
export async function findHorizontalOverflow(page: Page): Promise<HorizontalOverflowReport> {
  return page.evaluate((tolerance) => {
    const viewportWidth = document.documentElement.clientWidth;

    const describeElement = (element: Element): string => {
      const id = element.id ? `#${element.id}` : '';
      const className = element.getAttribute('class')?.trim() ?? '';
      const classes = className ? `.${className.split(/\s+/).join('.')}` : '';
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50);
      return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` — "${text}"` : ''}`;
    };

    const hasScrollingAncestor = (element: Element): boolean => {
      for (let node = element.parentElement; node; node = node.parentElement) {
        const { overflowX } = window.getComputedStyle(node);
        if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') {
          return true;
        }
      }
      return false;
    };

    const isRendered = (element: Element): boolean => {
      const { display, visibility } = window.getComputedStyle(element);
      return display !== 'none' && visibility !== 'hidden';
    };

    const overflowsViewport = (rect: DOMRect): boolean =>
      rect.width > 0 &&
      rect.height > 0 &&
      (rect.right > viewportWidth + tolerance || rect.left < -tolerance);

    const candidates = Array.from(document.body.querySelectorAll('*')).filter(
      (element) =>
        isRendered(element) &&
        overflowsViewport(element.getBoundingClientRect()) &&
        !hasScrollingAncestor(element),
    );

    const innermost = candidates.filter(
      (element) => !candidates.some((other) => other !== element && element.contains(other)),
    );

    return {
      viewportWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      offenders: innermost.slice(0, 8).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          description: describeElement(element),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      }),
    };
  }, OVERFLOW_TOLERANCE_PX);
}

function formatOffenders(offenders: LayoutOffender[]): string {
  if (offenders.length === 0) {
    return '  (no single element identified — check margins, or an ancestor set wider than the viewport)';
  }
  return offenders
    .map(
      (offender) =>
        `  ${offender.description}\n    left=${offender.left} right=${offender.right} width=${offender.width}`,
    )
    .join('\n');
}

/**
 * The core mobile guard: nothing may sit outside the viewport horizontally, and
 * the page as a whole must not scroll sideways. A desktop-first redesign that
 * assumes a wide window breaks this first.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const report = await findHorizontalOverflow(page);

  expect(
    report.offenders,
    `Elements extend past the ${report.viewportWidth}px viewport:\n${formatOffenders(report.offenders)}`,
  ).toEqual([]);

  expect(
    report.documentScrollWidth,
    `Page scrolls horizontally at ${report.viewportWidth}px (scrollWidth ${report.documentScrollWidth}px).`,
  ).toBeLessThanOrEqual(report.viewportWidth + OVERFLOW_TOLERANCE_PX);
}

/**
 * Catches controls pushed out of reach by a clipping ancestor. `overflow: hidden`
 * excuses an element from the overflow check above, but a button hidden that way
 * is genuinely unusable on a phone, so it is checked separately.
 */
export async function expectInteractiveControlsReachable(page: Page): Promise<void> {
  const unreachable = await page.evaluate((tolerance) => {
    const viewportWidth = document.documentElement.clientWidth;

    return Array.from(document.body.querySelectorAll('button, input, select, textarea, a[href]'))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          return false;
        }
        return rect.left < -tolerance || rect.right > viewportWidth + tolerance;
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const label = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
        const name = element.getAttribute('name') ?? element.getAttribute('aria-label') ?? '';
        return `${element.tagName.toLowerCase()}${name ? `[${name}]` : ''}${label ? ` "${label}"` : ''} (left=${Math.round(rect.left)}, right=${Math.round(rect.right)})`;
      });
  }, OVERFLOW_TOLERANCE_PX);

  expect(
    unreachable,
    `Interactive controls fall outside the viewport and cannot be tapped:\n  ${unreachable.join('\n  ')}`,
  ).toEqual([]);
}
