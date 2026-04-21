import type { BuildingAdditionCatalogEntry } from './architectural_style_types';

/**
 * Purpose-tagged catalog for projecting galleries, defensive works, and ornamental bands.
 * Weights are relative within the eligible pool after filtering.
 */
export const BUILDING_ADDITION_CATALOG: BuildingAdditionCatalogEntry[] = [
  {
    kind: 'balcony',
    role: 'both',
    eligiblePurposes: ['residential', 'civic', 'commercial'],
    weight: 12,
  },
  {
    kind: 'widow_walk',
    role: 'both',
    eligiblePurposes: ['residential', 'civic', 'commercial'],
    weight: 6,
  },
  {
    kind: 'roof_terrace',
    role: 'functional',
    eligiblePurposes: ['residential', 'civic', 'commercial'],
    weight: 8,
  },
  {
    kind: 'loggia',
    role: 'both',
    eligiblePurposes: ['residential', 'civic', 'commercial', 'religious'],
    weight: 10,
  },
  {
    kind: 'arcade',
    role: 'both',
    eligiblePurposes: ['civic', 'commercial', 'religious'],
    weight: 11,
  },
  {
    kind: 'oriel_window',
    role: 'ornamental',
    eligiblePurposes: ['residential', 'commercial', 'civic'],
    weight: 9,
  },
  {
    kind: 'bay_projection',
    role: 'both',
    eligiblePurposes: ['residential', 'commercial'],
    weight: 10,
  },
  {
    kind: 'machicolations',
    role: 'functional',
    eligiblePurposes: ['defensive'],
    weight: 14,
  },
  {
    kind: 'bartizan',
    role: 'both',
    eligiblePurposes: ['defensive'],
    weight: 12,
  },
  {
    kind: 'wall_walk',
    role: 'functional',
    eligiblePurposes: ['defensive', 'civic'],
    weight: 10,
  },
  {
    kind: 'flying_buttress',
    role: 'both',
    eligiblePurposes: ['religious'],
    weight: 10,
    requiresMasonry: true,
  },
  {
    kind: 'entry_canopy',
    role: 'functional',
    eligiblePurposes: ['civic', 'commercial', 'religious', 'residential'],
    weight: 11,
  },
  {
    kind: 'loading_bay_cover',
    role: 'functional',
    eligiblePurposes: ['storage', 'commercial'],
    weight: 13,
  },
  {
    kind: 'drying_gallery',
    role: 'functional',
    eligiblePurposes: ['storage', 'residential'],
    weight: 7,
  },
  {
    kind: 'belfry',
    role: 'ornamental',
    eligiblePurposes: ['religious', 'civic'],
    weight: 10,
  },
  {
    kind: 'cornice_drip_band',
    role: 'ornamental',
    eligiblePurposes: ['civic', 'commercial', 'religious', 'residential'],
    weight: 8,
    requiresMasonry: true,
  },
  {
    kind: 'pergola',
    role: 'both',
    eligiblePurposes: ['residential', 'civic', 'commercial'],
    weight: 7,
  },
  {
    kind: 'external_stair',
    role: 'functional',
    eligiblePurposes: ['storage', 'defensive', 'civic', 'commercial', 'residential'],
    weight: 9,
  },
];
