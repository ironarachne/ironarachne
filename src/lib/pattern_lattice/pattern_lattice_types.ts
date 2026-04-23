/**
 * Geometric cell grid (weft/warp block colors). Tokapu-inspired, culture-neutral;
 * no charges—color blocks only, serializable.
 */
export type PatternLattice = {
  rows: number;
  cols: number;
  /** row-major, length rows * cols, each a CSS #RRGGBB. */
  cells: string[];
};
