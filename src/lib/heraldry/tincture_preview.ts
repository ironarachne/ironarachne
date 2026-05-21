import { buildAnyOptionPreviewSvg } from './heraldry_option_preview.js';
import type { Tincture } from './tinctures.js';

export { buildAnyOptionPreviewSvg as buildAnyTincturePreviewSvg };

const PREVIEW_STROKE = '#333333';

export function buildTincturePreviewSvg(
  tincture: Tincture,
  size: number,
  patternIdSuffix: string,
): string {
  if (tincture.hexColor) {
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">` +
      `<rect width="${size}" height="${size}" fill="${tincture.hexColor}" stroke="${PREVIEW_STROKE}" stroke-width="1"/>` +
      `</svg>`
    );
  }

  const patternId = `tincture-preview-${tincture.name}-${patternIdSuffix}`;
  const pattern = tincture.pattern.replace(`id="${tincture.name}"`, `id="${patternId}"`);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">` +
    `<defs>${pattern}</defs>` +
    `<rect width="${size}" height="${size}" fill="url(#${patternId})" stroke="${PREVIEW_STROKE}" stroke-width="1"/>` +
    `</svg>`
  );
}

export function buildTinctureOptionPreviewSvg(
  value: string,
  tinctures: Tincture[],
  size: number,
  patternIdSuffix: string,
): string {
  if (value === 'any') {
    return buildAnyOptionPreviewSvg(size);
  }

  const tincture = tinctures.find((entry) => entry.name === value);
  if (tincture === undefined) {
    return buildAnyOptionPreviewSvg(size);
  }

  return buildTincturePreviewSvg(tincture, size, patternIdSuffix);
}
