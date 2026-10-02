export type RegionMapSvgSettlement = {
  id?: string;
  mapNodeId?: number;
  isCapital?: boolean;
  name?: string;
  /** Drives label size, so a city reads larger than a hamlet. */
  population?: number;
};

/** Derived drawing inputs only; semantic IDs and names come from saved regional facts. */
export type RegionMapSvgFeature = {
  id: string;
  name: string;
  kind: 'habitat' | 'landmark' | 'hazard';
  nodeIds: number[];
  edgeIds: number[];
};

export type RegionMapSvgOptions = {
  title?: string;
  settlements?: RegionMapSvgSettlement[];
  features?: RegionMapSvgFeature[];
};
