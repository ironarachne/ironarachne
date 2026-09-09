import type { MapEdge } from './map_graph';

export type RiverReach = {
  edge: MapEdge;
  from: number;
  to: number;
  source: boolean;
  startFlow: number;
  endFlow: number;
};
