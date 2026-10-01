import type {
  GeologyFact,
  ResourceDepositFact,
  ResourceAvailability,
  ResourceCatalogSource,
} from './region_resource_types';
import type { EcologyInhabitantFact, EcologyRelationshipFact } from './region_ecology_types';
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
  | 'dominantEcosystem'
  | 'ecosystems';
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
export type ResourceKind =
  | 'freshwater'
  | 'arable-land'
  | 'fish'
  | 'timber'
  | 'stone'
  | 'ore'
  | 'gemstone'
  | 'fiber'
  | 'animal-material'
  | 'food'
  | 'geological-material'
  | 'oil'
  | 'gas';
export type ResourceFact = FactBase & {
  kind: ResourceKind;
  availability: ResourceAvailability;
  depositIds: string[];
  catalogSource?: ResourceCatalogSource;
  areaIds: string[];
  habitatIds: string[];
  anchor?: SpatialAnchor;
};
export type RouteKind = 'road' | 'river';
export type RouteEndpoint =
  | { kind: 'settlement'; settlement: SettlementTarget }
  | { kind: 'notable'; notableId: string }
  | { kind: 'boundary'; edgeId: number };
export type RouteFact = FactBase & {
  kind: RouteKind;
  areaIds: string[];
  anchor: SpatialAnchor;
  endpoints: [RouteEndpoint, RouteEndpoint];
};
export type CausalFact = FactBase & { subjectId: string; relatedIds: string[] };

export type RegionFacts = {
  version: 3;
  geology: GeologyFact[];
  resourceDeposits: ResourceDepositFact[];
  state: FactState;
  areas: RegionArea[];
  habitats: HabitatFact[];
  settlementRoles: SettlementRoleFact[];
  notables: NotableFact[];
  resources: ResourceFact[];
  routes: RouteFact[];
  claims: CausalFact[];
  ecologyInhabitants: EcologyInhabitantFact[];
  ecologyRelationships: EcologyRelationshipFact[];
};
