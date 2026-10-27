import type { AltitudeBand, ReliefClass } from '$lib/map';

/** Stable stream names are part of the seeded generation contract. */
export type RegionGenerationStage =
  | 'physical-geography'
  | 'environment'
  | 'geology'
  | 'habitats'
  | 'landscape-names'
  | 'dense-forests'
  | 'forest-landmark'
  | 'mountain-ranges'
  | 'ecology-inhabitants'
  | 'ecology-relationships'
  | 'ecology-narrative'
  | 'managed-production'
  | 'resource-inventory'
  | 'processing'
  | 'livelihoods'
  | 'supply'
  | 'resources'
  | 'affiliation'
  | 'region-name'
  | 'neighbors'
  | 'habitation'
  | 'river-geometry'
  | 'notable-places'
  | 'regional-identity'
  | 'presentation';
export type RegionTerrainProfile = { altitude: AltitudeBand; relief: ReliefClass };
