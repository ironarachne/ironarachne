import { contrastRatio } from '$lib/display_colors/display_palettes.js';

const MIN_TEXT_CONTRAST = 4.5;

const TEXT_COLOR_CANDIDATES = ['#FFFFFF', '#F5F5F5', '#F8F4EC', '#111111', '#2A2A2A'];

const SCRIM_BACKGROUND = 'rgba(17, 17, 17, 0.82)';
const SCRIM_TEXT = '#FFFFFF';

export type BadgeInitialsStyle = {
  text: string;
  scrim?: string;
};

function minContrastAgainstBackgrounds(text: string, backgrounds: string[]): number {
  let min = Infinity;
  for (const background of backgrounds) {
    min = Math.min(min, contrastRatio(text, background));
  }
  return min;
}

/**
 * Picks readable initials color for a badge whose background uses every swatch
 * (e.g. conic gradient). Prefers candidates that meet WCAG contrast on all backgrounds.
 */
export function pickBadgeTextColorForBackgrounds(backgrounds: string[]): string {
  let bestColor = '#FFFFFF';
  let bestMinContrast = 0;
  let bestPassingColor: string | undefined;
  let bestPassingMinContrast = 0;

  for (const candidate of TEXT_COLOR_CANDIDATES) {
    const minContrast = minContrastAgainstBackgrounds(candidate, backgrounds);
    if (minContrast >= MIN_TEXT_CONTRAST && minContrast > bestPassingMinContrast) {
      bestPassingMinContrast = minContrast;
      bestPassingColor = candidate;
    }
    if (minContrast > bestMinContrast) {
      bestMinContrast = minContrast;
      bestColor = candidate;
    }
  }

  return bestPassingColor ?? bestColor;
}

/**
 * Text styling for badge initials. Uses a dark scrim when no single text color
 * contrasts with every gradient segment.
 */
export function pickBadgeInitialsStyle(backgrounds: string[]): BadgeInitialsStyle {
  const text = pickBadgeTextColorForBackgrounds(backgrounds);
  if (minContrastAgainstBackgrounds(text, backgrounds) >= MIN_TEXT_CONTRAST) {
    return { text };
  }

  return {
    text: SCRIM_TEXT,
    scrim: SCRIM_BACKGROUND,
  };
}
