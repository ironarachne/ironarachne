import type { Vertex } from '$lib/geometry';
import type { PlacedTerrainGlyph } from './terrain_glyph_types';
import type { CubicInkSegment } from './terrain_glyph_types';

/** Saved graph membership only; canopy artwork is derived when drawing. */
export type DenseForestGeometry = { mapNodeIds: number[] };

/** Renderer-local canopy placements, never stored in a region snapshot. */
export type PlacedDenseForestGlyph = PlacedTerrainGlyph & {
  forestId: string;
  interiorInk: boolean;
  canopy: DenseForestCanopy;
};

export type DenseForestCanopy = {
  body: string;
  footprint?: Vertex[];
  segments: CubicInkSegment[];
  radiusX: number;
  radiusY: number;
};
