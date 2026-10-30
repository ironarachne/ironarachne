import type { FactReason } from './region_fact_types';

export type RegionLandscapeOwner = 'landscape' | 'notable-place';
export type LandscapeFactFootprint = { factId: string; nodeIds: number[] };
export type LandscapeCellObservation = {
  nodeId: number;
  x: number;
  y: number;
  neighborIds: number[];
};
export type LandscapeFootprintObservation = {
  kind: 'landscape-footprint';
  footprints: LandscapeFactFootprint[];
  landNodeIds: number[];
  mapWidth: number;
  mapHeight: number;
  cells: LandscapeCellObservation[];
};
export type RegionLandscapePlace = {
  id: string;
  primaryFactId: string;
  aliasFactIds: string[];
  owner: RegionLandscapeOwner;
  descriptor?: string;
  reason: FactReason;
  observations: LandscapeFootprintObservation[];
};
export type RegionLandscapeReference = {
  label: string;
  placeId: string;
  owner: RegionLandscapeOwner;
};
