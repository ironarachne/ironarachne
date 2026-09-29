import type { SettlementSnapshot } from '$lib/settlements';

/** Identity in this saved region, independent of a settlement's editable name. */
export type RegionSettlement = { id: string; snapshot: SettlementSnapshot };

export type FactOrigin = 'generated' | 'authored';
export type FactState = 'current' | 'legacy';
export type ReasonStatus = 'current' | 'stale';
export type EnvironmentFactField =
  | 'climate'
  | 'terrain'
  | 'biome'
  | 'waterSystem'
  | 'dominantEcosystem';
export type MapNodeFactProperty =
  | 'elevation'
  | 'moisture'
  | 'temperature'
  | 'isWater'
  | 'isOcean'
  | 'isCoast'
  | 'biomeId';
export type MapEdgeFactProperty = 'river' | 'road';

export type FactSource =
  | { kind: 'environment'; field: EnvironmentFactField; observedValue: string }
  | { kind: 'map-node'; nodeId: number; property: MapNodeFactProperty; observedValue: string }
  | { kind: 'map-edge'; edgeId: number; property: MapEdgeFactProperty; observedValue: string }
  | { kind: 'fact'; factId: string };

export type FactReason = { ruleId: string; status: ReasonStatus; sources: FactSource[] };
export type SpatialAnchor = { nodeIds: number[]; edgeIds: number[] };
export type FactBase = {
  id: string;
  name: string;
  description: string;
  origin: FactOrigin;
  reason?: FactReason;
};
export type RegionArea = FactBase & { mapNodeIds: number[] };
export type HabitatFact = FactBase & { areaIds: string[]; anchor?: SpatialAnchor };
export type SettlementTarget =
  | { kind: 'embedded'; settlementId: string }
  | { kind: 'artifact'; targetId: string };
export type SettlementRoleFact = FactBase & {
  settlement: SettlementTarget;
  areaIds: string[];
  anchor: SpatialAnchor;
};
export type NotableFact = FactBase & {
  kind: 'landmark' | 'hazard';
  areaIds: string[];
  anchor?: SpatialAnchor;
};
export type CausalFact = FactBase & { subjectId: string; relatedIds: string[] };

export type RegionFacts = {
  version: 1;
  state: FactState;
  areas: RegionArea[];
  habitats: HabitatFact[];
  settlementRoles: SettlementRoleFact[];
  notables: NotableFact[];
  claims: CausalFact[];
};
