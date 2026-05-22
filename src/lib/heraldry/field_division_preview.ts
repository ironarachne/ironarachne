import * as Fields from './fields.js';
import {
  applyPreviewPalette,
  buildAnyOptionPreviewSvg,
  extractPatternBody,
  patternContentViewBox,
  wrapPatternPreviewSvg,
} from './heraldry_option_preview.js';

export function buildFieldDivisionPreviewSvg(fieldName: string, size: number): string {
  if (fieldName === 'any') {
    return buildAnyOptionPreviewSvg(size);
  }

  const field = Fields.byName(fieldName);
  const body = applyPreviewPalette(extractPatternBody(field.pattern));
  const viewBox = patternContentViewBox(field.pattern);

  return wrapPatternPreviewSvg(body, size, viewBox.width, viewBox.height);
}
