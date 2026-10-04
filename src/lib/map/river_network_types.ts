import type { Vertex } from '$lib/geometry';

export type RiverJunctionLocation =
  | { kind: 'corner'; cornerId: number }
  | { kind: 'surface'; nodeId: number };
export type RiverOutletTarget =
  | { kind: 'ocean' | 'lake'; nodeId: number }
  | { kind: 'boundary'; side: 'north' | 'east' | 'south' | 'west' };
export type RiverJunctionRole =
  | { kind: 'source' | 'continuation' | 'confluence' | 'split' }
  | { kind: 'outlet'; target: RiverOutletTarget };
export type RiverJunction = {
  id: string;
  point: Vertex;
  localSupply: number;
  location: RiverJunctionLocation;
  role: RiverJunctionRole;
};
export type RiverReachKind = 'ordinary' | 'deltaConnector' | 'distributary';
export type RiverSizeClass = 'stream' | 'channel' | 'broad';
export type ChannelSample = { point: Vertex; waterWidth: number };
export type RiverChannelReach = {
  id: string;
  fromJunctionId: string;
  toJunctionId: string;
  drainageEdgeId: number;
  kind: RiverReachKind;
  flow: number;
  sizeClass: RiverSizeClass;
  corridorNodeIds: number[];
  samples: ChannelSample[];
};
export type RiverIsland = { id: string; reachId: string; outline: Vertex[] };
export type RiverDelta = {
  id: string;
  drainageEdgeId: number;
  splitJunctionId: string;
  branchReachIds: string[];
};
export type RiverNetwork = {
  version: 1;
  origin: 'generated' | 'legacy';
  junctions: RiverJunction[];
  reaches: RiverChannelReach[];
  islands: RiverIsland[];
  deltas: RiverDelta[];
};

export const RIVER_LIMITS = {
  samples: 128,
  islandsPerReach: 2,
  islandVertices: 32,
  branches: 3,
  attempts: 8,
  graphEntries: 10_000,
  totalSamples: 250_000,
  maxDimension: 10_000,
} as const;
