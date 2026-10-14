import type { FactBase, ResourceFact } from './region_fact_types';
import type { RegionalProductFact } from './region_processing_types';
import type { ResourceSourceFact } from './region_raw_source_types';

export type FoodLeafRef =
  | { kind: 'source'; sourceId: string }
  | { kind: 'import'; productId: string; inputIndex: number };
export type FoodRestriction = { leaf: FoodLeafRef; allowedProductKeys: string[] };
export type FoodAssessmentStatus =
  | 'eligible'
  | 'ingredient-only'
  | 'requires-preparation'
  | 'not-food'
  | 'unknown'
  | 'invalid';
export type FoodAssessment = {
  status: FoodAssessmentStatus;
  pending: FoodRestriction[];
  requirements: string[];
  issues: string[];
};
/** A view over saved data; the caller supplies access/evidence checks for its own context. */
export type RegionFoodGraph = {
  products: readonly RegionalProductFact[];
  resourceSources: readonly ResourceSourceFact[];
  resources: readonly ResourceFact[];
};
export type FoodEvidenceCheck = (fact: FactBase) => boolean;
