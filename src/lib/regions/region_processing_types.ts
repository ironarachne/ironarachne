import type { ProcessingInputRole, ProcessingRecipe, Resource } from '$lib/resources';
import type { FactBase, SettlementTarget, SpatialAnchor, ResourceFact } from './region_fact_types';
export type ProcessingInput =
  | {
      kind: 'resource';
      role: ProcessingInputRole;
      resourceId: string;
      anchor: SpatialAnchor;
      depositIds: string[];
    }
  | { kind: 'product'; role: ProcessingInputRole; productId: string }
  | { kind: 'import'; role: ProcessingInputRole; resourceName: string; explanation: string };
export type RegionalProductFact = FactBase & {
  productKey: string;
  recipeId: string;
  technique: string;
  requirements: string[];
  inputs: ProcessingInput[];
  settlement: SettlementTarget;
  areaIds: string[];
  anchor: SpatialAnchor;
};
export type AccessibleProcessingResource = {
  fact: ResourceFact;
  resource: Resource;
  anchor: SpatialAnchor;
  depositIds: string[];
};
export type RegionProcessingCatalog = { recipes: readonly ProcessingRecipe[] };
export type ResolvedProcessingChain = {
  products: RegionalProductFact[];
  localInputs: Extract<ProcessingInput, { kind: 'resource' }>[];
  imports: Extract<ProcessingInput, { kind: 'import' }>[];
  issues: string[];
};
