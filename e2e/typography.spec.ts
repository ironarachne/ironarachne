import { expect, test } from '@playwright/test';
import { visitRoute } from './helpers';

/**
 * The body face is declared with `format('woff2-variations')`, which a browser
 * that does not recognise the hint discards outright — the page then falls back
 * to system-ui and looks fine while rendering in the wrong font. Nothing else in
 * the suite would notice, so assert the faces actually load rather than only
 * that the stack names them.
 */

type LoadedFace = { style: string; weight: string; status: string };

async function inclusiveSansFaces(page: import('@playwright/test').Page): Promise<LoadedFace[]> {
  return page.evaluate(async () => {
    const faces = [...document.fonts].filter(
      (face) => face.family.replace(/['"]/g, '') === 'Inclusive Sans',
    );
    await Promise.all(faces.map((face) => face.load().catch(() => undefined)));
    return faces.map((face) => ({ style: face.style, weight: face.weight, status: face.status }));
  });
}

test('the body face is Inclusive Sans, ahead of the system fallbacks', async ({ page }) => {
  await visitRoute(page, '/');

  const stack = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(stack.replace(/['"]/g, '')).toBe('Inclusive Sans, system-ui, Helvetica, sans-serif');
});

test('both Inclusive Sans files load, roman and italic', async ({ page }) => {
  await visitRoute(page, '/');

  const faces = await inclusiveSansFaces(page);

  expect(faces).toHaveLength(2);
  for (const face of faces) {
    expect(face.status, `${face.style} face failed to load`).toBe('loaded');
    expect(face.weight).toBe('300 700');
  }
  expect(faces.map((face) => face.style).sort()).toEqual(['italic', 'normal']);
});

test('italic text resolves to the italic file rather than a slanted roman', async ({ page }) => {
  await visitRoute(page, '/');

  const usesRealItalic = await page.evaluate(async () => {
    await document.fonts.load('italic 400 1em "Inclusive Sans"');
    return document.fonts.check('italic 400 1em "Inclusive Sans"');
  });

  expect(usesRealItalic).toBe(true);
});

test('headings still use the display face', async ({ page }) => {
  await visitRoute(page, '/release-notes', { title: 'Release Notes | Iron Arachne' });

  const heading = page.getByRole('heading', { level: 1, name: 'Release Notes' });
  await expect(heading).toBeVisible();

  const headingStack = await heading.evaluate((node) => getComputedStyle(node).fontFamily);
  expect(headingStack.replace(/['"]/g, '')).toBe('cinzel, system-ui, Helvetica, sans-serif');
});
