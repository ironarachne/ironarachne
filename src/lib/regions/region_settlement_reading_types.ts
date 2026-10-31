import type { SettlementEconomicRole } from '$lib/settlements';
import type { SettlementTarget } from './region_fact_types';

export type RegionSettlementReading = {
  settlement: SettlementTarget;
  portraitSentenceIds: string[];
  opportunitySentenceIds: string[];
};
export type SettlementCharacterObservation = {
  kind: 'settlement-character';
  settlementId: string;
  categoryName: string;
  prosperity: number;
  lawAndOrder: number;
  commerce: number;
  foodSecurity: number;
  publicHealth: number;
  economicRole: SettlementEconomicRole;
  settlementTags: string[];
};
