import type {
  ProducerRef,
  ManagedProductionMode,
  RawResourceSnapshot,
  HarvestMethod,
} from '$lib/resources';
import type { FactBase, SpatialAnchor, SettlementTarget } from './region_fact_types';
import type { ResourceAvailability } from './region_resource_types';

export type ManagedProductionFact = FactBase & {
  producer: ProducerRef;
  mode: ManagedProductionMode;
  productionRuleId: string;
  settlement: SettlementTarget;
  areaIds: string[];
  habitatIds: string[];
  anchor: SpatialAnchor;
  supportingResourceIds: string[];
  supportingInhabitantIds: string[];
};
export type SupplyOrigin =
  | { kind: 'wild'; inhabitantId: string }
  | { kind: 'managed'; productionId: string }
  | { kind: 'deposit'; depositId: string };
export type WaterSourceRef =
  | { kind: 'river'; edgeId: number }
  | { kind: 'lake'; nodeId: number }
  | { kind: 'ocean'; nodeId: number };
export type ResourceSourceFact = FactBase & {
  definitionId: string;
  resource: RawResourceSnapshot;
  source: SupplyOrigin;
  method: HarvestMethod;
  requirements: string[];
  availability: ResourceAvailability;
  areaIds: string[];
  habitatIds: string[];
  anchor: SpatialAnchor;
  waterSources: WaterSourceRef[];
};
