import type { FactBase } from './region_fact_types';

export type MountainRangeFact = FactBase & {
  mapNodeIds: number[];
  spineNodeIds: number[];
};
