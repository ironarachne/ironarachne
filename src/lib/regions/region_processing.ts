import type { RNG } from '@ironarachne/rng';
import { getProcessingRecipes, type ProcessingRecipe } from '$lib/resources';
import type Region from './region';
import type { FactSource } from './region_fact_types';
import type {
  ProcessingInput,
  RegionalProductFact,
  RegionProcessingCatalog,
} from './region_processing_types';
import {
  accessibleProcessingResources,
  reachableProcessingNodes,
  processingEvidenceCurrent,
} from './region_processing_resources';

import { processingRecipes, matchingProcessingResources } from './region_processing_capability';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Save complete possible chains, never instantiate a workshop or rescue a missing input with imports. */
export function generateProcessingFacts(
  region: Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'>,
  rng: RNG,
  catalog: RegionProcessingCatalog = { recipes: getProcessingRecipes() },
): void {
  const facts = region.facts;
  if (!facts) return;
  const recipes = processingRecipes(catalog.recipes);
  const byOutput = new Map(recipes.map((recipe) => [recipe.outputKey, recipe]));
  const consumed = new Set(
    recipes.flatMap((recipe) =>
      recipe.inputs.flatMap((input) =>
        input.selector.kind === 'product' ? [input.selector.productKey] : [],
      ),
    ),
  );
  const terminals = new Map<string, RegionalProductFact[]>();
  const built = new Map<string, RegionalProductFact>();
  const settlements = region.settlements
    .map((settlement, index) => ({ settlement, id: region.settlementIds?.[index] }))
    .filter((entry) => entry.id !== undefined)
    .sort((a, b) => lexical(a.id!, b.id!));
  for (const { settlement, id } of settlements) {
    const node = region.map.nodes.find(
      (entry) => entry.id === settlement.mapNodeId && !entry.isWater && !entry.isOcean,
    );
    if (!node) continue;
    const role = facts.settlementRoles.find(
      (entry) =>
        entry.id.startsWith('role:site:') &&
        entry.settlement.kind === 'embedded' &&
        entry.settlement.settlementId === id &&
        entry.anchor.nodeIds.includes(node.id) &&
        processingEvidenceCurrent(entry, facts),
    );
    if (!role) continue;
    const resources = accessibleProcessingResources(
      region,
      reachableProcessingNodes(region, node.id),
    );
    const cache = new Map<string, RegionalProductFact | null>();
    const heights = new Map<string, number>();
    const build = (recipe: ProcessingRecipe, visiting: Set<string>): RegionalProductFact | null => {
      if (visiting.has(recipe.outputKey) || !recipe.inputs.length) return null;
      if (cache.has(recipe.outputKey)) return cache.get(recipe.outputKey)!;
      const next = new Set(visiting);
      next.add(recipe.outputKey);
      const inputs: ProcessingInput[] = [];
      let height = 1;
      const sources: FactSource[] = [
        { kind: 'fact', factId: role.id },
        {
          kind: 'map-node',
          nodeId: node.id,
          property: 'isWater',
          observedValue: String(node.isWater),
        },
      ];
      for (const requirement of recipe.inputs) {
        if (requirement.selector.kind === 'raw') {
          const eligible = matchingProcessingResources(resources, requirement.selector);
          if (!eligible.length) {
            cache.set(recipe.outputKey, null);
            return null;
          }
          const chosen = rng.item(eligible);
          inputs.push({
            kind: 'resource',
            role: requirement.role,
            resourceId: chosen.fact.id,
            anchor: chosen.anchor,
            depositIds: chosen.depositIds,
          });
          sources.push(
            { kind: 'fact', factId: chosen.fact.id },
            ...chosen.depositIds.map((factId) => ({ kind: 'fact' as const, factId })),
          );
        } else {
          const parentRecipe = byOutput.get(requirement.selector.productKey);
          const parent = parentRecipe ? build(parentRecipe, next) : null;
          if (!parent) {
            cache.set(recipe.outputKey, null);
            return null;
          }
          inputs.push({ kind: 'product', role: requirement.role, productId: parent.id });
          height = Math.max(height, 1 + heights.get(parent.productKey)!);
          sources.push({ kind: 'fact', factId: parent.id });
        }
      }
      if (height > 4) {
        cache.set(recipe.outputKey, null);
        return null;
      }
      const fact: RegionalProductFact = {
        id: `product:${encodeURIComponent(id!)}:${encodeURIComponent(recipe.outputKey)}`,
        name: recipe.outputName,
        description: `${settlement.name} could produce ${recipe.outputName.toLowerCase()} by ${recipe.technique}, assuming ${recipe.requirements.join(', ') || 'the declared craft capability'}. This is a possible chain, not an existing industry.`,
        origin: 'generated',
        productKey: recipe.outputKey,
        recipeId: recipe.id,
        technique: recipe.technique,
        requirements: [...recipe.requirements],
        inputs,
        settlement: { kind: 'embedded', settlementId: id! },
        areaIds: facts.areas
          .filter((area) => area.mapNodeIds.includes(node.id))
          .map((area) => area.id)
          .sort(),
        anchor: { nodeIds: [node.id], edgeIds: [] },
        reason: {
          ruleId: recipe.id,
          status: 'current',
          sources: [...new Map(sources.map((source) => [JSON.stringify(source), source])).values()],
        },
      };
      cache.set(recipe.outputKey, fact);
      heights.set(recipe.outputKey, height);
      built.set(fact.id, fact);
      return fact;
    };
    for (const recipe of recipes.filter((entry) => !consumed.has(entry.outputKey))) {
      const product = build(recipe, new Set());
      if (!product) continue;
      const family = terminals.get(recipe.family) ?? [];
      family.push(product);
      terminals.set(recipe.family, family);
    }
  }
  const selected = new Map<string, RegionalProductFact>();
  const closure = (
    product: RegionalProductFact,
    seen = new Set<string>(),
  ): RegionalProductFact[] => {
    if (seen.has(product.id)) return [];
    seen.add(product.id);
    return [
      ...product.inputs.flatMap((input) =>
        input.kind === 'product' && built.has(input.productId)
          ? closure(built.get(input.productId)!, seen)
          : [],
      ),
      product,
    ];
  };
  const families = [...terminals.keys()].sort(lexical);
  let count = 0;
  while (families.length && count < 3) {
    const family = rng.item(families);
    families.splice(families.indexOf(family), 1);
    const choices = terminals.get(family)!.sort((a, b) => lexical(a.id, b.id));
    const chain = closure(rng.item(choices));
    if (new Set([...selected.keys(), ...chain.map((entry) => entry.id)]).size > 12) continue;
    for (const product of chain) selected.set(product.id, product);
    count++;
  }
  facts.products.push(...selected.values());
}
