import { describe, expect, it } from 'vitest';
import * as Tinctures from './tinctures.js';
import {
  buildAnyTincturePreviewSvg,
  buildTinctureOptionPreviewSvg,
  buildTincturePreviewSvg,
} from './tincture_preview.js';

describe('buildTincturePreviewSvg', () => {
  it('renders flat colors from hex', () => {
    const svg = buildTincturePreviewSvg(Tinctures.byName('gules'), 16, 'test');
    expect(svg).toContain('fill="#D40D02"');
    expect(svg).not.toContain('<defs>');
  });

  it('renders fur patterns with unique ids', () => {
    const svg = buildTincturePreviewSvg(Tinctures.byName('vair'), 16, 'test');
    expect(svg).toContain('id="tincture-preview-vair-test"');
    expect(svg).toContain('fill="url(#tincture-preview-vair-test)"');
  });

  it('builds any preview and resolves option values', () => {
    expect(buildAnyTincturePreviewSvg(16)).toContain('<text');
    expect(buildTinctureOptionPreviewSvg('azure', Tinctures.all(), 16, 'option')).toContain(
      'fill="#0731BA"',
    );
  });
});
