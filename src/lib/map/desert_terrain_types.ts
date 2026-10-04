import type { LandformClass } from './region_terrain';

export type DesertBiomeKind = 'warm' | 'cold' | 'unspecified';

export interface DesertCellProfile {
  nodeId: number;
  biomeKind: DesertBiomeKind;
  landform: LandformClass;
  cactusEligible: boolean;
}

/** Eligibility only: selection and fit can still omit the vegetation mark. */
export interface DesertOasisSite {
  id: string;
  waterNodeIds: number[];
  shoreNodeIds: number[];
  waterArea: number;
}
