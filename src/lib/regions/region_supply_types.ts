import type { FactBase, SettlementTarget, SpatialAnchor } from './region_fact_types';
import type { RecipeInputSelector } from '$lib/resources';

export type SupplyStatus = 'limited-local' | 'local-not-supported';
export type ImportSuggestion = { goodName: string; explanation: string };
export type SettlementSupplyFact = FactBase & {
  needKey: string;
  status: SupplyStatus;
  settlement: SettlementTarget;
  siteRoleId: string;
  areaIds: string[];
  anchor: SpatialAnchor;
  resourceIds: string[];
  productIds: string[];
  missingInputKeys: string[];
  importSuggestion?: ImportSuggestion;
};

/** Transient assessment of complete possibilities, before representative product selection. */
export type ProcessingCapability = {
  supported: boolean;
  limited: boolean;
  resourceIds: string[];
  missingInputKeys: string[];
  depth: number;
};

/** Stable fantasy supply policy; not stored in an artifact. */
export type SupplyNeed = {
  key: string;
  name: string;
  selector?: RecipeInputSelector;
  outputs: string[];
  use: string;
  consequence: string;
};
