import type { Vertex } from '$lib/geometry';
import type { PlacedTerrainGlyph, TextBox } from './terrain_glyph_types';

/** Saved-graph references; detection never invents or alters terrain. */
export type MountainRangeGeometry = {
  mapNodeIds: number[];
  spineNodeIds: number[];
};

/** Renderer-local artwork. The saved range contains no SVG or placements. */
export type PlacedMountainRangeGlyph = PlacedTerrainGlyph & {
  rangeId: string;
  position: number;
  saddle?: { body: string; ink: string; outline: Vertex[]; bounds: TextBox };
};
