import type { AltitudeBand, ReliefClass } from '$lib/map';

/** Stable stream names are part of the seeded generation contract. */
export type RegionGenerationStage =
  | 'physical-geography'
  | 'geology'
  | 'habitats'
  | 'landscape-names'
  | 'ecology-inhabitants'
  | 'ecology-relationships'
  | 'ecology-narrative'
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
  | 'presentation';
export type RegionTerrainProfile = { altitude: AltitudeBand; relief: ReliefClass };
