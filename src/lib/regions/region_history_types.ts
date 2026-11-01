import type { OrganizationRelationKind } from '$lib/organizations';
import type { FactOrigin, FactReason } from './region_fact_types';

export type HistoryReference =
  | { kind: 'settlement'; settlementId: string }
  | { kind: 'realm'; realmId: string }
  | { kind: 'organization'; organizationId: string }
  | { kind: 'fact'; factId: string }
  | { kind: 'historicalActor'; actorId: string };
export type HistoryPresentReference = Exclude<HistoryReference, { kind: 'historicalActor' }>;
export type HistoryConsequenceKind =
  | 'existence'
  | 'claim-continuity'
  | 'subordination'
  | 'rivalry'
  | 'abandonment'
  | 'recovery'
  | 'population-origin';
export type WarResolution = 'rivalry-persists' | 'claim-persists';
export type HistoryOutcome =
  | { kind: 'founding'; founded: HistoryReference }
  | { kind: 'war'; sides: HistoryReference[]; resolution: WarResolution }
  | { kind: 'incorporation'; predecessor: HistoryReference; successorRealmId: string }
  | { kind: 'fall'; historicalRealmId: string; successorRealmId: string }
  | { kind: 'disaster'; damageFactId: string; disasterKind: string }
  | { kind: 'migration'; movementFactId: string; communityId: string };
export type RealmHistoryObservation = {
  kind: 'realm';
  realmId: string;
  name: string;
  parentRealmId: string | null;
  tiles: number[];
  claims: { claimantRealmId: string; status: string }[];
};
export type OrganizationHistoryObservation = {
  kind: 'organization';
  organizationId: string;
  name: string;
  relationships: { relatedOrganizationId: string; kind: OrganizationRelationKind }[];
};
export type SettlementHistoryObservation = {
  kind: 'settlement';
  settlementId: string;
  name: string;
  mapNodeId: number;
};
export type FactHistoryObservation = { kind: 'fact'; factId: string; observed: string };
export type HistoryObservation =
  | RealmHistoryObservation
  | OrganizationHistoryObservation
  | SettlementHistoryObservation
  | FactHistoryObservation;
export type HistoryEvidence = { reason: FactReason; observations: HistoryObservation[] };
export type HistoryConsequence = { target: HistoryPresentReference; kind: HistoryConsequenceKind };
export type HistoryTime = { order: number; yearsBeforePresent?: number };
export type HistoryEvent = {
  id: string;
  name: string;
  description: string;
  origin: FactOrigin;
  time: HistoryTime;
  outcome: HistoryOutcome;
  participants: HistoryReference[];
  consequences: HistoryConsequence[];
  causedByEventIds: string[];
  evidence: HistoryEvidence;
};
export type HistoricalActorKind = 'realm' | 'community';
export type HistoricalActor = {
  id: string;
  name: string;
  kind: HistoricalActorKind;
  origin: FactOrigin;
};
export type HistoryState = 'unrecorded' | 'generated' | 'authored';
export type RegionHistory = {
  version: 1;
  state: HistoryState;
  actors: HistoricalActor[];
  events: HistoryEvent[];
};
