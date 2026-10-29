import {
  getProcessingRecipes,
  processingSelectorSatisfies,
  matchesProcessingSource,
  getPlantProducts,
  getBuildingMaterialResources,
  getGeologicalResources,
} from '$lib/resources';
import type { ProcessingRecipe } from '$lib/resources';
import type { RegionMap } from '$lib/map';
import type { RegionFacts, SettlementTarget } from './region_fact_types';
import type { DailyLifeInput } from './region_livelihood_types';
import type { ActivityMaterialSupport, SettlementActivityFact } from './region_activity_types';
import { dailyLifeInputCurrent, sameSettlement } from './region_livelihood_evidence';
import { createProcessingEvidenceChecker, reachableProcessingNodes } from './region_evidence';
import { resolveProcessingChain } from './region_processing_chain';

/** Imports must explicitly cover one unambiguous recipe slot; text alone proves no material. */
export function activityImportsSupported(
  facts: RegionFacts,
  productId: string,
  recipes: readonly ProcessingRecipe[] = getProcessingRecipes(),
): boolean {
  const chain = resolveProcessingChain(facts, productId);
  return chain.products.every((product) => {
    const recipe = recipes.find(
      (entry) => entry.id === product.recipeId && entry.outputKey === product.productKey,
    );
    if (!recipe) return false;
    const matches = (
      input: (typeof product.inputs)[number],
      slot: (typeof recipe.inputs)[number],
    ): boolean => {
      if (input.role !== slot.role || input.foodUse !== slot.foodUse) return false;
      if (input.kind === 'import')
        return (
          !!input.satisfies &&
          input.satisfies.kind !== 'settlement-water' &&
          processingSelectorSatisfies(input.satisfies, slot.selector)
        );
      if (input.kind === 'product')
        return (
          slot.selector.kind === 'product' &&
          facts.products.find((entry) => entry.id === input.productId)?.productKey ===
            slot.selector.productKey
        );
      if (input.kind === 'settlement-water') return slot.selector.kind === 'settlement-water';
      const source = facts.resourceSources.find((entry) => entry.id === input.sourceId)?.resource;
      const resource = facts.resources.find((entry) => entry.id === input.resourceId);
      if (!resource) return false;
      const catalog = resource.catalogSource;
      const descriptor = source
        ? { name: source.name, major_type: source.majorType, minor_type: source.minorType }
        : catalog?.kind === 'plant-product'
          ? getPlantProducts(catalog.plantName).find((entry) => entry.name === catalog.resourceName)
          : catalog?.kind === 'geological-resource'
            ? getGeologicalResources().find((entry) => entry.resource.name === catalog.resourceName)
                ?.resource
            : catalog?.kind === 'building-material'
              ? getBuildingMaterialResources().find((entry) => entry.name === catalog.resourceName)
              : !catalog && ['timber', 'freshwater'].includes(resource.kind)
                ? {
                    name: resource.kind === 'timber' ? 'timber' : 'freshwater',
                    major_type: resource.kind === 'timber' ? 'wood' : 'water',
                    minor_type: resource.kind === 'timber' ? 'timber' : 'freshwater',
                  }
                : undefined;
      return (
        !!descriptor &&
        matchesProcessingSource(
          slot.selector,
          { ...descriptor, description: '', is_refineable: false, properties: [], commonality: 1 },
          source?.id,
        )
      );
    };
    if (product.inputs.length !== recipe.inputs.length) return false;
    const used = new Set<number>();
    return product.inputs.every((input) => {
      const slots = recipe.inputs
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => matches(input, slot));
      if (slots.length !== 1 || used.has(slots[0].index)) return false;
      used.add(slots[0].index);
      return true;
    });
  });
}

/** Classify complete saved support without turning an omitted inventory entry into absence. */
export function resolveActivitySupport(
  facts: RegionFacts,
  map: RegionMap,
  start: number,
  settlement: SettlementTarget,
  inputs: DailyLifeInput[],
  productionIds: string[],
  recipes?: readonly ProcessingRecipe[],
): Exclude<ActivityMaterialSupport['kind'], 'unknown'> | null {
  const current = createProcessingEvidenceChecker(facts);
  let local = productionIds.length > 0;
  let external = false;
  if (!inputs.length && !productionIds.length) return null;
  const reached = reachableProcessingNodes({ map }, start);
  for (const id of productionIds) {
    const production = facts.managedProduction.find((entry) => entry.id === id);
    if (
      !production ||
      !sameSettlement(production.settlement, settlement) ||
      !current(production) ||
      !production.anchor.nodeIds.some((id) => reached.has(id))
    )
      return null;
    const resources = production.supportingResourceIds.map((id) =>
      facts.resources.find((entry) => entry.id === id),
    );
    if (
      !resources.length ||
      resources.some(
        (resource) =>
          !resource ||
          !['available', 'limited'].includes(resource.availability) ||
          !current(resource) ||
          !resource.anchor?.nodeIds.some((id) => reached.has(id)),
      )
    )
      return null;
    if (
      production.mode === 'cultivation' &&
      (!resources.some((resource) => resource?.kind === 'freshwater') ||
        !resources.some(
          (resource) =>
            resource?.kind === 'arable-land' &&
            production.anchor.nodeIds.every((id) => resource.anchor?.nodeIds.includes(id)),
        ))
    )
      return null;
    if (
      !production.supportingInhabitantIds.every((id) => {
        const inhabitant = facts.ecologyInhabitants.find((entry) => entry.id === id);
        return inhabitant !== undefined && current(inhabitant);
      })
    )
      return null;
  }
  for (const input of inputs) {
    if (input.kind === 'resource') {
      if (!dailyLifeInputCurrent(facts, map, start, settlement, input, current)) return null;
      local = true;
      continue;
    }
    const chain = resolveProcessingChain(facts, input.productId, current);
    if (
      chain.issues.length ||
      !chain.products.length ||
      chain.products.some((product) => !sameSettlement(product.settlement, settlement)) ||
      !chain.localInputs.every((raw) =>
        dailyLifeInputCurrent(facts, map, start, settlement, raw, current),
      ) ||
      !activityImportsSupported(facts, input.productId, recipes)
    )
      return null;
    local ||= chain.localInputs.length > 0 || chain.settlementWaterInputs.length > 0;
    external ||= chain.imports.length > 0;
  }
  return external ? (local ? 'mixed' : 'external') : 'local';
}

export function activityEvidenceCurrent(
  facts: RegionFacts,
  map: RegionMap,
  activity: SettlementActivityFact,
): boolean {
  const expected: Record<string, string> = {
    'craft-linen': 'linen',
    'craft-woven-mats': 'woven-mats',
    'craft-construction-components': 'construction-components',
    'craft-dressed-stone': 'dressed-stone',
  };
  if (activity.support.kind === 'unknown') return false;
  if (
    expected[activity.activityKey] &&
    !activity.support.inputs.some(
      (input) =>
        input.kind === 'product' &&
        facts.products.find((product) => product.id === input.productId)?.productKey ===
          expected[activity.activityKey],
    )
  )
    return false;
  if (
    activity.activityKey === 'cultivation' &&
    !activity.support.productionIds.some((id) =>
      facts.managedProduction.some(
        (production) => production.id === id && production.mode === 'cultivation',
      ),
    )
  )
    return false;
  const role = facts.settlementRoles.find((entry) => entry.id === activity.siteRoleId);
  return (
    !!role &&
    sameSettlement(role.settlement, activity.settlement) &&
    createProcessingEvidenceChecker(facts)(activity) &&
    createProcessingEvidenceChecker(facts)(role) &&
    resolveActivitySupport(
      facts,
      map,
      activity.anchor.nodeIds[0],
      activity.settlement,
      activity.support.inputs,
      activity.support.productionIds,
    ) === activity.support.kind
  );
}
