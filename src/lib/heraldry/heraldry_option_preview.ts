export const PREVIEW_COLOR_1 = '#0731BA';
export const PREVIEW_COLOR_2 = '#F0D41F';
export const PREVIEW_COLOR_3 = '#D40D02';
export const PREVIEW_STROKE = '#333333';

export function buildAnyOptionPreviewSvg(size: number): string {
  const half = size / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">` +
    `<rect width="${size}" height="${size}" fill="#f0f0f0" stroke="${PREVIEW_STROKE}" stroke-width="1"/>` +
    `<path d="M0,0 L${size},${size} M${size},0 L0,${size}" stroke="#cccccc" stroke-width="1"/>` +
    `<text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central" font-size="${Math.max(6, size * 0.45)}" fill="#666666">?</text>` +
    `</svg>`
  );
}

export function extractPatternBody(pattern: string): string {
  const match = pattern.match(/<pattern[^>]*>([\s\S]*)<\/pattern>/);
  return match?.[1] ?? pattern;
}

export function applyPreviewPalette(content: string): string {
  return content
    .replaceAll('url(#variation1)', PREVIEW_COLOR_1)
    .replaceAll('url(#variation2)', PREVIEW_COLOR_2)
    .replaceAll('url(#variation3)', PREVIEW_COLOR_3)
    .replaceAll('tincture1', PREVIEW_COLOR_1)
    .replaceAll('tincture2', PREVIEW_COLOR_2);
}

export function patternContentViewBox(pattern: string): { width: number; height: number } {
  const widthMatch = pattern.match(/\bwidth="(\d+)"/);
  const heightMatch = pattern.match(/\bheight="(\d+)"/);
  const width = widthMatch ? Number(widthMatch[1]) : 600;
  const height = heightMatch ? Number(heightMatch[1]) : 660;

  if (width <= 1 && height <= 1) {
    return { width: 600, height: 660 };
  }

  return { width, height };
}

export function wrapPatternPreviewSvg(
  body: string,
  size: number,
  viewWidth: number,
  viewHeight: number,
): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewWidth} ${viewHeight}" aria-hidden="true">` +
    `<rect width="${viewWidth}" height="${viewHeight}" fill="#ffffff"/>` +
    body +
    `</svg>`
  );
}
