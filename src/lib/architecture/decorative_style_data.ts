import type { DecorativeStyleId } from './architectural_style_types';

export type DecorativeStyleEntry = {
  id: DecorativeStyleId;
  /** Minimum Mohs-like hardness on a primary stone to allow carving (if stone-led). */
  minStoneHardnessForCarving?: number;
  /** Requires a wood primary or secondary when true. */
  requiresWood: boolean;
  /** Requires masonry or plaster-friendly surface. */
  requiresMasonryOrPlaster: boolean;
  /** Requires metal with structural or ornamental metal role (processed metal not modeled yet—metalwork is gated loosely). */
  requiresMetalAffordance: boolean;
};

export const DECORATIVE_STYLE_ENTRIES: DecorativeStyleEntry[] = [
  {
    id: 'carved_stone',
    minStoneHardnessForCarving: 3,
    requiresWood: false,
    requiresMasonryOrPlaster: true,
    requiresMetalAffordance: false,
  },
  {
    id: 'painted_plaster',
    requiresWood: false,
    requiresMasonryOrPlaster: true,
    requiresMetalAffordance: false,
  },
  {
    id: 'tile_inlay',
    requiresWood: false,
    requiresMasonryOrPlaster: true,
    requiresMetalAffordance: false,
  },
  {
    id: 'metalwork',
    requiresWood: false,
    requiresMasonryOrPlaster: false,
    requiresMetalAffordance: true,
  },
  {
    id: 'wood_carving',
    requiresWood: true,
    requiresMasonryOrPlaster: false,
    requiresMetalAffordance: false,
  },
  {
    id: 'minimal',
    requiresWood: false,
    requiresMasonryOrPlaster: false,
    requiresMetalAffordance: false,
  },
];
