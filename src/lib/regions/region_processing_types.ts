import type {
  RecipeInputSelector,
  ProcessingInputRole,
  ProcessingRecipe,
  Resource,
  ProductContext,
} from '$lib/resources';
import type { FactBase, SettlementTarget, SpatialAnchor, ResourceFact } from './region_fact_types';
import type { FoodInputUse, ImportedFoodDescriptor, ProductFoodPolicy } from '$lib/resources';
export type ProcessingInput = (
  | {
      kind: 'resource';
      role: ProcessingInputRole;
      resourceId: string;
      sourceId?: string;
      anchor: SpatialAnchor;
      depositIds: string[];
    }
  | { kind: 'product'; role: ProcessingInputRole; productId: string }
  | { kind: 'settlement-water'; role: 'water'; explanation: string }
  | {
      kind: 'import';
      role: ProcessingInputRole;
      resourceName: string;
      satisfies?: RecipeInputSelector;
      explanation: string;
      foodDescriptor?: ImportedFoodDescriptor;
    }
) & { foodUse?: FoodInputUse };
export type RegionalProductFact = FactBase & {
  food?: ProductFoodPolicy;
  context?: ProductContext;
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
  sourceId?: string;
  acquisitionRequirements?: string[];
  rawResourceId?: string;
  food?: import('$lib/resources').FoodSuitability;
  sourceAvailability?: import('./region_resource_types').ResourceAvailability;
  resource: Resource;
  anchor: SpatialAnchor;
  depositIds: string[];
};
export type RegionProcessingCatalog = { recipes: readonly ProcessingRecipe[] };
export type ResolvedProcessingChain = {
  products: RegionalProductFact[];
  localInputs: Extract<ProcessingInput, { kind: 'resource' }>[];
  imports: Extract<ProcessingInput, { kind: 'import' }>[];
  settlementWaterInputs: Extract<ProcessingInput, { kind: 'settlement-water' }>[];
  issues: string[];
};

export type PlannedProcessingInput =
  | Extract<ProcessingInput, { kind: 'resource' | 'settlement-water' }>
  | {
      kind: 'product';
      role: ProcessingInputRole;
      foodUse?: import('$lib/resources').FoodInputUse;
      productKey: string;
    };
export type PlannedProduct = {
  recipeId: string;
  productKey: string;
  inputs: PlannedProcessingInput[];
};
export type ProcessingPlanResult =
  | {
      status: 'supported';
      limited: boolean;
      depth: number;
      products: PlannedProduct[];
      resourceIds: string[];
      requirements: string[];
    }
  | { status: 'unsupported'; missingInputKeys: string[]; issues: string[] }
  | { status: 'incomplete'; issues: string[] };

export type ProcessingPlanSite = { id: string; name: string; nodeId: number; roleId: string };
