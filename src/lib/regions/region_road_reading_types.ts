import type { FactReason, SettlementTarget, SpatialAnchor } from './region_fact_types';
import type { RegionEditorialObservation } from './region_editorial_types';

export type RegionObservedRoad = {
  routeId: string;
  endpoints: [SettlementTarget, SettlementTarget];
  anchor: SpatialAnchor;
};
export type RegionRoadNetworkObservation = {
  kind: 'road-network';
  settlementIds: string[];
  roads: RegionObservedRoad[];
};
export type RegionRoadPathObservation = RegionObservedRoad & { kind: 'road-path' };
export type RegionRoadReading = {
  routeId: string;
  reason: FactReason;
  observations: RegionEditorialObservation[];
  detailOwnerRouteId?: string;
  promptNotableId?: string;
};
