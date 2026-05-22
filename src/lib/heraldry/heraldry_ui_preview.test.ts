import { describe, expect, it } from 'vitest';
import { buildFieldDivisionPreviewSvg } from './field_division_preview.js';
import { PREVIEW_COLOR_1, PREVIEW_COLOR_2 } from './heraldry_option_preview.js';
import { buildVariationPreviewSvg } from './variation_preview.js';

describe('buildFieldDivisionPreviewSvg', () => {
  it('renders any and divided field previews', () => {
    expect(buildFieldDivisionPreviewSvg('any', 16)).toContain('<text');
    expect(buildFieldDivisionPreviewSvg('fess', 16)).toContain(PREVIEW_COLOR_1);
    expect(buildFieldDivisionPreviewSvg('fess', 16)).toContain(PREVIEW_COLOR_2);
    expect(buildFieldDivisionPreviewSvg('pall', 16)).toContain('fill="' + PREVIEW_COLOR_1);
  });
});

describe('buildVariationPreviewSvg', () => {
  it('renders any and striped variation previews', () => {
    expect(buildVariationPreviewSvg('any', 16)).toContain('<text');
    expect(buildVariationPreviewSvg('barry', 16)).toContain(PREVIEW_COLOR_1);
    expect(buildVariationPreviewSvg('chequy', 16)).toContain('viewBox="0 0 80 80"');
  });
});
