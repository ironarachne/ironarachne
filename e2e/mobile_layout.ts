import { expect, type Page } from '@playwright/test';

/** Sub-pixel rounding in layout means an exact comparison produces false failures. */
const OVERFLOW_TOLERANCE_PX = 1;

/**
 * Marks an element that is *meant* to scroll sideways, and is the only thing that excuses one.
 *
 * There are three in the app — the scrolling variant of `DataTable`, the family tree, and the
 * phonetics table on the word-generator cheat sheet — and each carries this attribute beside the
 * `overflow-x: auto` that makes it real, so the exemption and the behaviour it excuses are written
 * in the same place.
 *
 * The attribute exists because the obvious test — "does an ancestor scroll horizontally?" — is
 * wrong in a way that cost this suite its meaning. `.shell__page` sets `overflow-y: auto` so the
 * page region scrolls under the pinned shell; CSS then computes the *other* axis to `auto` too,
 * because `visible` cannot pair with a scrolling value. So the page region is a horizontal scroll
 * container by accident, every element on every page has a horizontally-scrolling ancestor, and a
 * check that skips those skips the entire application. That is what it did: `mobile-390` passed
 * forty routes green while a real phone scrolled sideways, because the overflow was trapped inside
 * that scroller where neither the element sweep nor `documentElement.scrollWidth` could see it.
 */
const DELIBERATE_SCROLLER = 'data-scroll-x';

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

export type OverflowingScroller = {
  description: string;
  scrollWidth: number;
  clientWidth: number;
};

export type HorizontalOverflowReport = {
  viewportWidth: number;
  documentScrollWidth: number;
  offenders: LayoutOffender[];
  scrollers: OverflowingScroller[];
};

/**
 * Reports two distinct ways a page can be too wide for a phone.
 *
 * `offenders` are elements that extend past either edge of the viewport, ignoring only those
 * inside a scroller marked `data-scroll-x`. Nothing else is excused — in particular, being inside
 * `.shell__page` is not a defence, which is the whole point of the rewrite.
 *
 * `scrollers` are scroll containers with more content than they can show. This catches the same
 * bug from the other side: when a wide child sits inside the page region, the child's rect and the
 * region's `scrollWidth` both say so, but the *document* stays exactly one viewport wide because
 * the region absorbed it. A check that only ever asked the document could not tell a page that
 * fits from a page whose overflow had somewhere to hide.
 *
 * Only the innermost offenders are returned: when a wide child forces a chain
 * of ancestors wide, the child is the thing worth naming.
 */
export async function findHorizontalOverflow(page: Page): Promise<HorizontalOverflowReport> {
  return page.evaluate(
    ({ tolerance, deliberate }) => {
      const viewportWidth = document.documentElement.clientWidth;

      const describeElement = (element: Element): string => {
        const id = element.id ? `#${element.id}` : '';
        const className = element.getAttribute('class')?.trim() ?? '';
        const classes = className ? `.${className.split(/\s+/).join('.')}` : '';
        const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50);
        return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` — "${text}"` : ''}`;
      };

      const hasDeliberateScrollAncestor = (element: Element): boolean => {
        for (let node = element.parentElement; node; node = node.parentElement) {
          if (node.hasAttribute(deliberate)) {
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
          !hasDeliberateScrollAncestor(element),
      );

      const innermost = candidates.filter(
        (element) => !candidates.some((other) => other !== element && element.contains(other)),
      );

      // Only genuine scroll containers. `overflow: hidden` is deliberately not one of them: it
      // clips rather than scrolls, and the app uses it for the visually-hidden label pattern,
      // where a 1px box holding a 112px word is the technique working rather than a layout fault.
      // A control clipped out of reach is still caught, by `expectInteractiveControlsReachable`.
      const scrollers = Array.from(document.querySelectorAll('*')).filter((element) => {
        if (element.hasAttribute(deliberate) || !isRendered(element)) {
          return false;
        }
        const { overflowX } = window.getComputedStyle(element);
        if (overflowX !== 'auto' && overflowX !== 'scroll') {
          return false;
        }
        return element.scrollWidth > element.clientWidth + tolerance;
      });

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
        scrollers: scrollers.slice(0, 8).map((element) => ({
          description: describeElement(element),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        })),
      };
    },
    { tolerance: OVERFLOW_TOLERANCE_PX, deliberate: DELIBERATE_SCROLLER },
  );
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

function formatScrollers(scrollers: OverflowingScroller[]): string {
  return scrollers
    .map(
      (scroller) =>
        `  ${scroller.description}\n    scrollWidth=${scroller.scrollWidth} clientWidth=${scroller.clientWidth}`,
    )
    .join('\n');
}

/**
 * The core mobile guard: nothing may sit outside the viewport horizontally, no scroll container
 * may be hiding content off to the side, and the page as a whole must not scroll sideways. A
 * desktop-first redesign that assumes a wide window breaks this first.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const report = await findHorizontalOverflow(page);

  expect(
    report.offenders,
    `Elements extend past the ${report.viewportWidth}px viewport:\n${formatOffenders(report.offenders)}`,
  ).toEqual([]);

  expect(
    report.scrollers,
    `Content is hidden sideways inside a scroll container that is not marked ${DELIBERATE_SCROLLER}:\n${formatScrollers(report.scrollers)}`,
  ).toEqual([]);

  expect(
    report.documentScrollWidth,
    `Page scrolls horizontally at ${report.viewportWidth}px (scrollWidth ${report.documentScrollWidth}px).`,
  ).toBeLessThanOrEqual(report.viewportWidth + OVERFLOW_TOLERANCE_PX);
}

/**
 * Catches controls pushed out of reach by a clipping ancestor. `overflow: hidden` excuses an
 * element from the sweep above — it clips rather than scrolls — but a button hidden that way is
 * genuinely unusable on a phone, so it is checked separately.
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
        // A control that is not rendered is not an unreachable control — it is not there. The
        // closed navigation drawer is the case that matters: it is parked off-canvas by a
        // transform, which leaves its links with a real size at a negative offset. `visibility`
        // is inherited, so the drawer's own `hidden` reaches every link inside it without this
        // having to walk ancestors. `findHorizontalOverflow` skips the same two states.
        const { display, visibility } = window.getComputedStyle(element);
        if (display === 'none' || visibility === 'hidden') {
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
