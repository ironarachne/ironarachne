import type { PatternLattice } from './pattern_lattice_types.js';

const VIEWBOX = 100;

/**
 * Renders a grid of rectangles; viewBox 0,0,100,100, rows/cols in cell space.
 */
export function renderPatternLatticeSvg(
  lattice: PatternLattice,
  width: number,
  height: number,
): string {
  const { rows, cols, cells } = lattice;
  if (rows <= 0 || cols <= 0 || cells.length !== rows * cols) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1" />`;
  }
  const cellW = VIEWBOX / cols;
  const cellH = VIEWBOX / rows;
  const rects: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fill = cells[r * cols + c];
      const x = c * cellW;
      const y = r * cellH;
      rects.push(
        `<rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${cellW.toFixed(4)}" height="${cellH.toFixed(4)}" fill="${fill}"/>`,
      );
    }
  }
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" xmlns="http://www.w3.org/2000/svg" version="1.1" preserveAspectRatio="xMidYMid meet">
${rects.join('\n')}
</svg>`.replace(/<\?xml.*\?>/g, '');
}
