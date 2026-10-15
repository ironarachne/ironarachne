import type { ProcessingRecipe, RecipeInputSelector } from '$lib/resources';
import type { AccessibleProcessingResource } from './region_processing_types';
import type { ProcessingCapability } from './region_supply_types';
import {
  createProcessingPlanner,
  processingCatalogErrors,
  matchingProcessingResources,
} from './region_processing_plan';
export { matchingProcessingResources } from './region_processing_plan';

export function processingRecipes(recipes: readonly ProcessingRecipe[]): ProcessingRecipe[] {
  const errors = processingCatalogErrors(recipes);
  if (errors.length) throw new Error(errors.join('; '));
  return [...recipes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
export function assessRawCapability(
  resources: AccessibleProcessingResource[],
  selector: RecipeInputSelector,
): ProcessingCapability {
  const matches = matchingProcessingResources(resources, selector);
  const available = matches.filter(
    (entry) => (entry.sourceAvailability ?? entry.fact.availability) === 'available',
  );
  const chosen = available.length ? available : matches;
  return {
    supported: chosen.length > 0,
    limited: chosen.length > 0 && available.length === 0,
    resourceIds: chosen.map((entry) => entry.fact.id).sort(),
    missingInputKeys: chosen.length ? [] : [JSON.stringify(selector)],
    depth: 0,
  };
}
/** Same deterministic full-chain plan as generation, without consuming the caller's RNG. */
export function assessProcessingCapability(
  recipes: readonly ProcessingRecipe[],
  resources: AccessibleProcessingResource[],
  outputKey: string,
): ProcessingCapability {
  return createProcessingCapabilityAssessor(recipes, resources)(outputKey);
}
export function createProcessingCapabilityAssessor(
  recipes: readonly ProcessingRecipe[],
  resources: AccessibleProcessingResource[],
): (outputKey: string) => ProcessingCapability {
  const planner = createProcessingPlanner(recipes, resources);
  return (outputKey) => {
    const plan = planner(outputKey);
    return plan.status === 'supported'
      ? {
          supported: true,
          limited: plan.limited,
          resourceIds: plan.resourceIds,
          missingInputKeys: [],
          depth: plan.depth,
        }
      : {
          supported: false,
          limited: false,
          resourceIds: [],
          missingInputKeys:
            plan.status === 'unsupported'
              ? [...plan.missingInputKeys, ...plan.issues]
              : plan.issues,
          depth: 0,
        };
  };
}
