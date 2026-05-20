import type { RNG } from '@ironarachne/rng';
import { DISPLAY_SWATCHES } from '$lib/display_colors/display_palettes.js';
import type { PatternLattice } from './pattern_lattice_types.js';

export type GeneratePatternLatticeOptions = {
  minDim?: number;
  maxDim?: number;
  /** Mirror left to right (tokapu-style repeat). */
  verticalMirror?: boolean;
  colorCount?: 2 | 3 | 4;
};

const DEFAULT_MIN = 4;
const DEFAULT_MAX = 8;

function buildPalette(
  rng: RNG,
  colorCount: number,
  swatchPool: { commonality: number; value: string }[],
): string[] {
  const palette: string[] = [];
  const maxTries = colorCount * 20;
  for (let t = 0; t < maxTries && palette.length < colorCount; t++) {
    const hex = rng.weighted(swatchPool);
    if (!palette.includes(hex)) {
      palette.push(hex);
    }
  }
  if (palette.length < 2) {
    for (const s of DISPLAY_SWATCHES) {
      if (palette.length >= 2) {
        break;
      }
      if (!palette.includes(s.hex)) {
        palette.push(s.hex);
      }
    }
  }
  return palette;
}

/**
 * Fills a rectangular grid with 2–4 display colors, optional vertical symmetry.
 */
export function generatePatternLattice(
  rng: RNG,
  options?: GeneratePatternLatticeOptions,
): PatternLattice {
  const minD = options?.minDim ?? DEFAULT_MIN;
  const maxD = options?.maxDim ?? DEFAULT_MAX;
  const colorCount = options?.colorCount ?? rng.int(2, 4);
  const useMirror = options?.verticalMirror ?? rng.int(0, 1) === 1;
  const rows = rng.int(minD, maxD);
  const cols = rng.int(minD, maxD);

  const swatchPool = DISPLAY_SWATCHES.map((s) => ({ commonality: s.commonality, value: s.hex }));
  const palette = buildPalette(rng, colorCount, swatchPool);
  const pickColor = () => palette[rng.int(0, palette.length - 1)]!;

  const cells: string[] = new Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (useMirror && c > cols - 1 - c) {
        continue;
      }
      const v = pickColor();
      const idx = r * cols + c;
      cells[idx] = v;
      if (useMirror) {
        const m = cols - 1 - c;
        if (m !== c) {
          cells[r * cols + m] = v;
        }
      }
    }
  }

  return { rows, cols, cells };
}
