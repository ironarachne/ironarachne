import type { AltitudeBand, ReliefClass } from '$lib/map';

/** Stable stream names are part of the seeded generation contract. */
export type RegionGenerationStage =
  | 'physical-geography'
  | 'geology'
  | 'habitats'
  | 'landscape-names'
  | 'ecology-inhabitants'
  | 'ecology-relationships'
  | 'processing'
  | 'livelihoods'
  | 'supply'
  | 'resources'
  | 'habitation'
  | 'notable-places'
  | 'presentation';
export type RegionTerrainProfile = { altitude: AltitudeBand; relief: ReliefClass };
