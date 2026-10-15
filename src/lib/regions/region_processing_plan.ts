import {
  getProcessingTechniques,
  isProductContext,
  isProductFoodPolicy,
  isFoodSuitability,
  matchesProcessingSource,
  type ProcessingRecipe,
  type RecipeInputSelector,
} from '$lib/resources';
import type {
  AccessibleProcessingResource,
  PlannedProduct,
  ProcessingPlanResult,
} from './region_processing_types';

export const PROCESSING_MAX_DEPTH = 8;
export const PROCESSING_MAX_PRODUCTS = 24;
export const SETTLEMENT_WATER_EXPLANATION =
  'The settlement has access to a reasonable amount of clean freshwater for ordinary food preparation and crafts.';
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Authoring errors are reported before selection, not silently overwritten or filtered. */
export function processingCatalogErrors(recipes: readonly ProcessingRecipe[]): string[] {
  const errors: string[] = [];
  const techniques = new Set(getProcessingTechniques().map((entry) => entry.technique));
  const ids = new Set<string>();
  const outputs = new Map<string, ProcessingRecipe>();
  for (const recipe of recipes) {
    if (ids.has(recipe.id)) errors.push(`Duplicate recipe ID: ${recipe.id}`);
    if (outputs.has(recipe.outputKey)) errors.push(`Duplicate output key: ${recipe.outputKey}`);
    ids.add(recipe.id);
    outputs.set(recipe.outputKey, recipe);
    if (!techniques.has(recipe.technique)) errors.push(`Unknown technique: ${recipe.technique}`);
    if (!recipe.inputs.length) errors.push(`Empty recipe: ${recipe.outputKey}`);
    if (recipe.food && !isProductFoodPolicy(recipe.food))
      errors.push(`Invalid food policy: ${recipe.outputKey}`);
    if (recipe.context && !isProductContext(recipe.context, recipe.food))
      errors.push(`Invalid product context: ${recipe.outputKey}`);
    for (const input of recipe.inputs) {
      const selector = input.selector;
      if (
        selector.kind === 'raw-resource' &&
        (!selector.rawResourceIds.length ||
          selector.rawResourceIds.some((id) => !id.trim()) ||
          new Set(selector.rawResourceIds).size !== selector.rawResourceIds.length)
      )
        errors.push(`Invalid raw identities: ${recipe.outputKey}`);
      if (selector.kind === 'settlement-water' && input.role !== 'water')
        errors.push(`Invalid settlement water role: ${recipe.outputKey}`);
      if (
        recipe.food?.kind === 'food' &&
        !(
          (input.role === 'material' && input.foodUse === 'ingredient') ||
          (input.role === 'fuel' && input.foodUse === 'support') ||
          (input.role === 'water' && ['ingredient', 'process-water'].includes(input.foodUse ?? ''))
        )
      )
        errors.push(`Invalid food input: ${recipe.outputKey}`);
    }
    if (
      recipe.food?.kind === 'food' &&
      !recipe.inputs.some((input) => input.foodUse === 'ingredient')
    )
      errors.push(`Food recipe has no ingredient: ${recipe.outputKey}`);
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (key: string) => {
    if (visiting.has(key)) {
      errors.push(`Cyclic recipe: ${key}`);
      return;
    }
    if (visited.has(key)) return;
    visiting.add(key);
    for (const input of outputs.get(key)!.inputs)
      if (input.selector.kind === 'product') {
        const parent = input.selector.productKey;
        if (!outputs.has(parent)) errors.push(`Missing recipe: ${parent}`);
        else visit(parent);
      }
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of outputs.keys()) visit(key);
  return [...new Set(errors)];
}
export function matchingProcessingResources(
  resources: AccessibleProcessingResource[],
  selector: RecipeInputSelector,
): AccessibleProcessingResource[] {
  return resources.filter((entry) =>
    matchesProcessingSource(selector, entry.resource, entry.rawResourceId),
  );
}

/**
 * A shared ingredient step must satisfy every downstream provision that consumes it. Collect
 * those constraints first, then choose each raw slot independently. This avoids a Cartesian
 * product of sources and keeps shared intermediates consistent across sibling branches.
 */
export function planProcessingChain(
  recipes: readonly ProcessingRecipe[],
  resources: AccessibleProcessingResource[],
  outputKey: string,
): ProcessingPlanResult {
  return createProcessingPlanner(recipes, resources)(outputKey);
}

/** Compile once for a site's many possible outputs; no module-level mutable cache. */
export function createProcessingPlanner(
  recipes: readonly ProcessingRecipe[],
  resources: AccessibleProcessingResource[],
): (outputKey: string) => ProcessingPlanResult {
  const errors = processingCatalogErrors(recipes);
  const byKey = new Map(recipes.map((recipe) => [recipe.outputKey, recipe]));
  return (outputKey) =>
    errors.length
      ? { status: 'unsupported', missingInputKeys: [`recipe:${outputKey}`], issues: [...errors] }
      : planCompiledChain(byKey, resources, outputKey);
}
function planCompiledChain(
  byKey: Map<string, ProcessingRecipe>,
  resources: AccessibleProcessingResource[],
  outputKey: string,
): ProcessingPlanResult {
  const issues: string[] = [];
  if (!byKey.has(outputKey))
    return { status: 'unsupported', missingInputKeys: [`recipe:${outputKey}`], issues };
  const constraints = new Map<string, Set<string | null>>();
  const visited = new Set<string>();
  const collect = (key: string, provision: string | null, needed: boolean) => {
    const recipe = byKey.get(key)!;
    const marker = JSON.stringify([key, provision, needed]);
    if (visited.has(marker)) return;
    visited.add(marker);
    if (needed && recipe.food?.kind !== 'food') issues.push(`Not a food ingredient: ${key}`);
    const target =
      recipe.food?.kind === 'food' && recipe.food.use === 'provision' ? key : provision;
    if (recipe.food?.kind === 'food') {
      const targets = constraints.get(key) ?? new Set<string | null>();
      targets.add(target);
      constraints.set(key, targets);
    }
    for (const { selector, foodUse } of recipe.inputs)
      if (selector.kind === 'product')
        collect(
          selector.productKey,
          recipe.food?.kind === 'food' && foodUse === 'ingredient' ? target : null,
          recipe.food?.kind === 'food' && foodUse === 'ingredient',
        );
  };
  collect(outputKey, null, false);
  const products = new Map<string, PlannedProduct>();
  const heights = new Map<string, number>();
  const missing = new Set<string>();
  const selected = new Map<string, AccessibleProcessingResource>();
  const requirements = new Set<string>();
  const build = (key: string) => {
    if (products.has(key)) return;
    const recipe = byKey.get(key)!;
    const inputs: PlannedProduct['inputs'] = [];
    let depth = 1;
    for (const text of [
      ...recipe.requirements,
      ...(recipe.food?.kind === 'food' ? recipe.food.requirements : []),
    ])
      requirements.add(text);
    for (const input of recipe.inputs) {
      const selector = input.selector;
      if (selector.kind === 'settlement-water') {
        inputs.push({
          kind: 'settlement-water',
          role: 'water',
          foodUse: input.foodUse,
          explanation: SETTLEMENT_WATER_EXPLANATION,
        });
        requirements.add(SETTLEMENT_WATER_EXPLANATION);
      } else if (selector.kind === 'product') {
        build(selector.productKey);
        depth = Math.max(depth, 1 + heights.get(selector.productKey)!);
        inputs.push({
          kind: 'product',
          role: input.role,
          foodUse: input.foodUse,
          productKey: selector.productKey,
        });
      } else {
        const eligible = matchingProcessingResources(resources, selector)
          .filter((entry) => {
            if (recipe.food?.kind === 'food' && input.foodUse === 'process-water')
              return entry.fact.kind === 'freshwater' && !entry.sourceId;
            if (recipe.food?.kind !== 'food' || input.foodUse !== 'ingredient') return true;
            const food = entry.food;
            return (
              isFoodSuitability(food) &&
              food.kind === 'food' &&
              (food.preparation === 'ordinary' ||
                [...(constraints.get(key) ?? [])].every(
                  (target) => target === null || food.productKeys.includes(target),
                ))
            );
          })
          .sort((a, b) => {
            const limited = (entry: AccessibleProcessingResource) =>
              (entry.sourceAvailability ?? entry.fact.availability) === 'limited' ? 1 : 0;
            return (
              limited(a) - limited(b) || lexical(a.sourceId ?? a.fact.id, b.sourceId ?? b.fact.id)
            );
          });
        const chosen = eligible[0];
        if (!chosen) {
          missing.add(JSON.stringify(selector));
          continue;
        }
        selected.set(chosen.sourceId ?? chosen.fact.id, chosen);
        for (const text of chosen.acquisitionRequirements ?? []) requirements.add(text);
        inputs.push({
          kind: 'resource',
          role: input.role,
          foodUse: input.foodUse,
          resourceId: chosen.fact.id,
          ...(chosen.sourceId ? { sourceId: chosen.sourceId } : {}),
          anchor: structuredClone(chosen.anchor),
          depositIds: [...chosen.depositIds],
        });
      }
    }
    heights.set(key, depth);
    if (depth > PROCESSING_MAX_DEPTH) missing.add(`depth:${key}`);
    products.set(key, { recipeId: recipe.id, productKey: key, inputs });
  };
  build(outputKey);
  if (products.size > PROCESSING_MAX_PRODUCTS) missing.add(`products:${outputKey}`);
  if (missing.size || issues.length)
    return {
      status: 'unsupported',
      missingInputKeys: [...missing].sort(),
      issues: [...new Set(issues)],
    };
  return {
    status: 'supported',
    limited: [...selected.values()].some(
      (entry) => (entry.sourceAvailability ?? entry.fact.availability) === 'limited',
    ),
    depth: heights.get(outputKey)!,
    products: [...products.values()],
    resourceIds: [...new Set([...selected.values()].map((entry) => entry.fact.id))].sort(),
    requirements: [...requirements].sort(),
  };
}
