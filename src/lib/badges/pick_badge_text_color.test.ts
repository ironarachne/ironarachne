import { describe, expect, it } from 'vitest';
import { contrastRatio } from '$lib/display_colors';
import {
  pickBadgeInitialsStyle,
  pickBadgeTextColorForBackgrounds,
} from './pick_badge_text_color.js';

describe('pickBadgeTextColorForBackgrounds', () => {
  it('prefers light text when backgrounds include dark swatches', () => {
    const textColor = pickBadgeTextColorForBackgrounds(['#111111', '#1E2A4A', '#2A2A2A']);
    expect(textColor).toMatch(/^#F/i);
  });

  it('meets contrast against every background color', () => {
    const backgrounds = ['#111111', '#0D6E6E', '#3D4A5C'];
    const textColor = pickBadgeTextColorForBackgrounds(backgrounds);
    for (const background of backgrounds) {
      expect(contrastRatio(textColor, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('pickBadgeInitialsStyle', () => {
  it('uses a scrim when no text color passes on all backgrounds', () => {
    const style = pickBadgeInitialsStyle(['#111111', '#F5F5F5', '#888888']);
    expect(style.scrim).toBeDefined();
    expect(style.text).toBe('#FFFFFF');
  });
});
