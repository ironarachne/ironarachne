import {
  applyPreviewPalette,
  buildAnyOptionPreviewSvg,
  extractPatternBody,
  patternContentViewBox,
  wrapPatternPreviewSvg,
} from './heraldry_option_preview.js';
import * as Variations from './variations.js';

export function buildVariationPreviewSvg(variationName: string, size: number): string {
  if (variationName === 'any') {
    return buildAnyOptionPreviewSvg(size);
  }

  const variation = Variations.byName(variationName);
  const body = applyPreviewPalette(extractPatternBody(variation.pattern));
  const viewBox = patternContentViewBox(variation.pattern);

  return wrapPatternPreviewSvg(body, size, viewBox.width, viewBox.height);
}
