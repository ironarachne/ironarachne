import type { Settlement } from '$lib/settlements';
import {
  getProcessingRecipes,
  matchesProcessingSource,
  processingSelectorSatisfies,
} from '$lib/resources';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionalProductFact } from './region_processing_types';
import type { SettlementCharacterObservation } from './region_settlement_reading_types';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { dailyLifeInputCurrent, sameSettlement } from './region_livelihood_evidence';
import { accessibleProcessingResources } from './region_processing_resources';
import { reachableProcessingNodes } from './region_evidence';
import { resolveProcessingChain } from './region_processing_chain';
import { assessRegionProductFood } from './region_food';
const ordered = (values: string[]) => [...new Set(values)].sort();
export function settlementCharacterObservation(
  settlementId: string,
  settlement: Pick<
    Settlement,
    | 'category'
    | 'prosperity'
    | 'lawAndOrder'
    | 'commerce'
    | 'foodSecurity'
    | 'publicHealth'
    | 'economicRole'
    | 'settlementTags'
  >,
): SettlementCharacterObservation {
  return {
    kind: 'settlement-character',
    settlementId,
    categoryName: settlement.category.name,
    prosperity: settlement.prosperity,
    lawAndOrder: settlement.lawAndOrder,
    commerce: settlement.commerce,
    foodSecurity: settlement.foodSecurity,
    publicHealth: settlement.publicHealth,
    economicRole: settlement.economicRole,
    settlementTags: ordered(settlement.settlementTags),
  };
}

/** Saved recipe chains are conditional capabilities, never proof of installed equipment. */
export function settlementWorkOptions(
  snapshot: RegionSnapshot,
  product: RegionalProductFact,
): string[] {
  const target = product.settlement;
  if (target.kind !== 'embedded') return [];
  const settlement = snapshot.settlements.find(
    (entry) => entry.id === target.settlementId,
  )?.snapshot;
  const start = settlement?.mapNodeId;
  if (!settlement?.name.trim() || start === undefined || product.origin === 'authored') return [];
  const current = createRegionEvidenceChecker(snapshot);
  const chain = resolveProcessingChain(snapshot.facts, product.id, current);
  if (
    chain.issues.length ||
    !chain.products.length ||
    chain.products.some(
      (entry) => !sameSettlement(entry.settlement, target) || entry.origin === 'authored',
    ) ||
    !chain.localInputs.every((input) =>
      dailyLifeInputCurrent(snapshot.facts, snapshot.map, start, target, input),
    )
  )
    return [];
  const resources = accessibleProcessingResources(
    snapshot,
    reachableProcessingNodes(snapshot, start),
    target.settlementId,
  );
  const recipes = getProcessingRecipes();
  for (const entry of chain.products) {
    const recipe = recipes.find(
      (recipe) => recipe.id === entry.recipeId && recipe.outputKey === entry.productKey,
    );
    if (
      !recipe ||
      entry.inputs.length !== recipe.inputs.length ||
      recipe.requirements.some((requirement) => !entry.requirements.includes(requirement))
    )
      return [];
    const used = new Set<number>();
    for (const input of entry.inputs) {
      const matches = recipe.inputs.flatMap((slot, index) => {
        if (input.role !== slot.role) return [];
        const matches =
          input.kind === 'product'
            ? slot.selector.kind === 'product' &&
              chain.products.some(
                (parent) =>
                  parent.id === input.productId &&
                  slot.selector.kind === 'product' &&
                  parent.productKey === slot.selector.productKey,
              )
            : input.kind === 'import'
              ? !!input.satisfies &&
                !!input.explanation.trim() &&
                processingSelectorSatisfies(input.satisfies, slot.selector)
              : input.kind === 'settlement-water'
                ? slot.selector.kind === 'settlement-water' && !!input.explanation.trim()
                : resources.some(
                    (resource) =>
                      resource.fact.id === input.resourceId &&
                      resource.sourceId === input.sourceId &&
                      matchesProcessingSource(
                        slot.selector,
                        resource.resource,
                        resource.rawResourceId,
                      ),
                  );
        return matches ? [index] : [];
      });
      if (matches.length !== 1 || used.has(matches[0])) return [];
      used.add(matches[0]);
    }
    if (
      entry.food?.kind === 'food' &&
      !['eligible', 'ingredient-only'].includes(
        assessRegionProductFood(snapshot.facts, entry.id, current).status,
      )
    )
      return [];
  }
  const material = product.inputs.find((input) => input.role === 'material');
  const inputName =
    material?.kind === 'resource'
      ? (snapshot.facts.resourceSources.find((source) => source.id === material.sourceId)?.resource
          .name ??
        snapshot.facts.resources.find((resource) => resource.id === material.resourceId)?.name)
      : material?.kind === 'product'
        ? snapshot.facts.products.find((entry) => entry.id === material.productId)?.name
        : material?.kind === 'import'
          ? material.resourceName
          : undefined;
  if (!inputName?.trim()) return [];
  const verbs: Record<string, string> = {
    'dried-provisions': `dry ${inputName} for provisions`,
    'smoked-provisions': `smoke ${inputName} for provisions`,
    'dressed-stone': `dress ${inputName} into building stone`,
    'sawn-timber': `saw ${inputName}`,
    'construction-components': `shape ${inputName} into construction components`,
    'woven-mats': `weave ${inputName} into mats`,
    'flax-yarn': `spin ${inputName} into yarn`,
    linen: `weave ${inputName} into linen`,
  };
  const work = verbs[product.productKey];
  if (!work) return [];
  const requirements = ordered([
    ...chain.products.flatMap((entry) => entry.requirements),
    ...chain.localInputs.flatMap(
      (input) =>
        snapshot.facts.resourceSources.find((source) => source.id === input.sourceId)
          ?.requirements ?? [],
    ),
    ...chain.settlementWaterInputs.map((input) => input.explanation),
    ...chain.imports.flatMap((input) => input.foodDescriptor?.requirements ?? []),
  ]);
  const limited = ordered(
    chain.localInputs.flatMap((input) => {
      const source = snapshot.facts.resourceSources.find((entry) => entry.id === input.sourceId);
      const resource = snapshot.facts.resources.find((entry) => entry.id === input.resourceId);
      return (source?.availability ?? resource?.availability) === 'limited'
        ? [source?.resource.name ?? resource!.name]
        : [];
    }),
  );
  const imports = ordered(
    chain.imports.map((input) => `${input.resourceName} (${input.explanation})`),
  );
  const otherConditions = [
    limited.length ? `using limited supplies of ${limited.join(', ')}` : '',
    imports.length ? `depending on imported ${imports.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('; ');
  const conditions = [
    requirements.length ? `requiring ${requirements.join(', ')}` : '',
    otherConditions,
  ]
    .filter(Boolean)
    .join('; ');
  return [
    `${settlement.name} could ${work}${conditions ? `, ${conditions}` : ''}.`,
    `${requirements.length ? `With ${requirements.join(', ')}, ` : ''}${settlement.name} could ${work}${otherConditions ? `, ${otherConditions}` : ''}.`,
  ];
}
