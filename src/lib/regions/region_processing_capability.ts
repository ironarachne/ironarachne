import {
  matchesProcessingInput,
  type ProcessingRecipe,
  type RecipeInputSelector,
} from '$lib/resources';
import type { AccessibleProcessingResource } from './region_processing_types';
import type { ProcessingCapability } from './region_supply_types';

const techniques = new Set([
  'woodworking',
  'weaving',
  'fiber preparation',
  'spinning',
  'charcoal making',
  'bloomery smelting',
  'forging',
  'smoking',
  'drying',
  'stone dressing',
]);

/** Shared policy and ordering preserve the processing generator's random draw contract. */
export function processingRecipes(recipes: readonly ProcessingRecipe[]): ProcessingRecipe[] {
  return [...recipes]
    .filter((recipe) => techniques.has(recipe.technique))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
export function matchingProcessingResources(
  resources: AccessibleProcessingResource[],
  selector: RecipeInputSelector,
): AccessibleProcessingResource[] {
  return resources.filter((entry) => matchesProcessingInput(selector, entry.resource));
}

export function assessRawCapability(
  resources: AccessibleProcessingResource[],
  selector: RecipeInputSelector,
): ProcessingCapability {
  const matches = matchingProcessingResources(resources, selector);
  // An available alternative prevents limited supply being inferred from a randomly chosen leaf.
  const available = matches.filter((entry) => entry.fact.availability === 'available');
  const chosen = available.length ? available : matches;
  return {
    supported: chosen.length > 0,
    limited: chosen.length > 0 && available.length === 0,
    resourceIds: chosen.map((entry) => entry.fact.id).sort(),
    missingInputKeys: chosen.length ? [] : [JSON.stringify(selector)],
    depth: 0,
  };
}

/** Pure complete-chain assessment: no random draws, saved products or import substitutions. */
export function assessProcessingCapability(
  recipes: readonly ProcessingRecipe[],
  resources: AccessibleProcessingResource[],
  outputKey: string,
  visiting = new Set<string>(),
): ProcessingCapability {
  const unsupported = (key: string): ProcessingCapability => ({
    supported: false,
    limited: false,
    resourceIds: [],
    missingInputKeys: [key],
    depth: 0,
  });
  if (visiting.has(outputKey)) return unsupported(`cycle:${outputKey}`);
  const recipe = processingRecipes(recipes).find((entry) => entry.outputKey === outputKey);
  if (!recipe?.inputs.length) return unsupported(`recipe:${outputKey}`);
  const next = new Set(visiting).add(outputKey);
  const inputs = recipe.inputs.map(({ selector }) =>
    selector.kind === 'raw'
      ? assessRawCapability(resources, selector)
      : assessProcessingCapability(recipes, resources, selector.productKey, next),
  );
  const depth = 1 + Math.max(...inputs.map((input) => input.depth));
  return {
    supported: depth <= 4 && inputs.every((input) => input.supported),
    limited: inputs.some((input) => input.limited),
    resourceIds: [...new Set(inputs.flatMap((input) => input.resourceIds))].sort(),
    missingInputKeys: [
      ...new Set([
        ...inputs.flatMap((input) => input.missingInputKeys),
        ...(depth > 4 ? [`depth:${outputKey}`] : []),
      ]),
    ].sort(),
    depth,
  };
}
