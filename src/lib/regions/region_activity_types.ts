import type { FactBase, SettlementTarget, SpatialAnchor } from './region_fact_types';
import type { DailyLifeInput } from './region_livelihood_types';

export type ActivityMaterialSupport =
  | { kind: 'local' | 'external' | 'mixed'; inputs: DailyLifeInput[]; productionIds: string[] }
  | { kind: 'unknown'; unresolvedRequirementKeys: string[]; explanation: string };

/** A declared practice, distinct from a possible livelihood or processing chain. */
export type SettlementActivityFact = FactBase & {
  activityKey: string;
  settlement: SettlementTarget;
  siteRoleId: string;
  areaIds: string[];
  anchor: SpatialAnchor;
  support: ActivityMaterialSupport;
};
