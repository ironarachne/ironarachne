import type { ArchitectureResources } from '$lib/architecture';

/** Transient generation plans; existing settlement architecture is the persisted result. */
export type RegionConstructionPlan = {
  policyVersion: 1;
  seed: string;
  baselineSupply: ArchitectureResources;
  settlements: SettlementConstructionPlan[];
};
export type SettlementConstructionPlan = {
  settlementId: string;
  localResources: ArchitectureResources;
  effectiveResources: ArchitectureResources;
  needsCompletion: boolean;
};
