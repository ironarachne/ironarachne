import type { SettlementIconCategory } from './settlement_icon_types';

export type RegionMapSvgMountainRange = {
  id: string;
  name: string;
  mapNodeIds: number[];
  spineNodeIds: number[];
};

export type RegionMapSvgSettlement = {
  id?: string;
  mapNodeId?: number;
  isCapital?: boolean;
  name?: string;
  /** Drives label size, so a city reads larger than a hamlet. */
  population?: number;
  category?: SettlementIconCategory;
};

/** Derived drawing inputs only; semantic IDs and names come from saved regional facts. */
export type RegionMapSvgFeature = {
  id: string;
  name: string;
  kind: 'habitat' | 'landmark' | 'hazard' | 'range';
  nodeIds: number[];
  edgeIds: number[];
};

export type RegionMapSvgDenseForest = { id: string; mapNodeIds: number[] };

export type RegionMapSvgRiverLabel = { id: string; name: string; edgeIds: number[] };

export type RegionMapSvgOptions = {
  rivers?: RegionMapSvgRiverLabel[];
  denseForests?: RegionMapSvgDenseForest[];
  mountainRanges?: RegionMapSvgMountainRange[];
  title?: string;
  settlements?: RegionMapSvgSettlement[];
  features?: RegionMapSvgFeature[];
};
