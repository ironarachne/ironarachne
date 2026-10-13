import type { FactSource } from './region_fact_types';

export type RegionEvidenceStatus = 'confirmed' | 'inferred' | 'unknown';
export type RegionAssessmentTopic =
  | 'resource-presence'
  | 'resource-exploitation'
  | 'cultivated-crop'
  | 'domesticated-source'
  | 'sustainable-yield'
  | 'water-purity'
  | 'river-presence'
  | 'road-at-river'
  | 'safe-crossing'
  | 'river-navigability';
export type RegionFactAssessment = {
  topic: RegionAssessmentTopic;
  status: RegionEvidenceStatus;
  explanation: string;
  sources: FactSource[];
};
