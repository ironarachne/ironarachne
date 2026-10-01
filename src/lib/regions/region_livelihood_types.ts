import type { FactBase, SettlementTarget, SpatialAnchor } from './region_fact_types';

export type DailyLifeCategory = 'livelihood' | 'staple' | 'building-material' | 'fuel' | 'craft';
export type DailyLifeInput =
  | { kind: 'resource'; resourceId: string; anchor: SpatialAnchor; depositIds: string[] }
  | { kind: 'product'; productId: string };
export type SettlementDailyLifeFact = FactBase & {
  category: DailyLifeCategory;
  activityKey: string;
  settlement: SettlementTarget;
  siteRoleId: string;
  areaIds: string[];
  anchor: SpatialAnchor;
  inputs: DailyLifeInput[];
};
export type SettlementDailyLifeContext = Record<DailyLifeCategory, SettlementDailyLifeFact[]>;
