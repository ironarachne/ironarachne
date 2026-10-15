import type { RNG } from '@ironarachne/rng';
import { getProcessingRecipes } from '$lib/resources';
import type Region from './region';
import type { FactSource } from './region_fact_types';
import type {
  ProcessingInput,
  PlannedProduct,
  RegionProcessingCatalog,
} from './region_processing_types';
import {
  accessibleProcessingResources,
  reachableProcessingNodes,
  processingEvidenceCurrent,
} from './region_processing_resources';
import { processingRecipes } from './region_processing_capability';
import {
  createProcessingPlanner,
  PROCESSING_MAX_PRODUCTS,
  SETTLEMENT_WATER_EXPLANATION,
} from './region_processing_plan';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Select complete plans before recording any facts. Neither planning nor selection invents imports. */
export function generateProcessingFacts(
  region: Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'>,
  rng: RNG,
  catalog: RegionProcessingCatalog = { recipes: getProcessingRecipes() },
): void {
  const facts = region.facts;
  if (!facts) return;
  const recipes = processingRecipes(catalog.recipes);
  const byOutput = new Map(recipes.map((entry) => [entry.outputKey, entry]));
  const consumed = new Set(
    recipes.flatMap((recipe) =>
      recipe.inputs.flatMap(({ selector }) =>
        selector.kind === 'product' ? [selector.productKey] : [],
      ),
    ),
  );
  type Candidate = {
    id: string;
    name: string;
    nodeId: number;
    roleId: string;
    products: PlannedProduct[];
    key: string;
  };
  const families = new Map<string, Candidate[]>();
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
      id,
    );
    const planOutput = createProcessingPlanner(recipes, resources);
    for (const recipe of recipes) {
      const baselineTerminal = [
        'construction-components',
        'woven-mats',
        'linen',
        'iron-tools',
        'smoked-provisions',
        'dried-provisions',
        'dressed-stone',
      ].includes(recipe.outputKey);
      if (
        consumed.has(recipe.outputKey) &&
        !baselineTerminal &&
        !(recipe.reviewRefs?.length && recipe.context?.uses.length)
      )
        continue;
      const plan = planOutput(recipe.outputKey);
      if (plan.status !== 'supported') continue;
      const choices = families.get(recipe.family) ?? [];
      choices.push({
        id: id!,
        name: settlement.name,
        nodeId: node.id,
        roleId: role.id,
        products: plan.products,
        key: recipe.outputKey,
      });
      families.set(recipe.family, choices);
    }
  }
  const productId = (settlementId: string, key: string) =>
    `product:${encodeURIComponent(settlementId)}:${encodeURIComponent(key)}`;
  const selected = new Map<string, { candidate: Candidate; product: PlannedProduct }>();
  const remaining = [...families.keys()].sort(lexical);
  let count = 0;
  while (remaining.length && count < 3) {
    const family = rng.item(remaining);
    remaining.splice(remaining.indexOf(family), 1);
    const choices = families
      .get(family)!
      .filter((candidate) => {
        if (
          new Set([
            ...selected.keys(),
            ...candidate.products.map((entry) => productId(candidate.id, entry.productKey)),
          ]).size > PROCESSING_MAX_PRODUCTS
        )
          return false;
        return candidate.products.every((product) => {
          const previous = selected.get(productId(candidate.id, product.productKey));
          return !previous || JSON.stringify(previous.product) === JSON.stringify(product);
        });
      })
      .sort((a, b) => lexical(`${a.id}:${a.key}`, `${b.id}:${b.key}`));
    if (!choices.length) continue;
    const candidate = rng.item(choices);
    for (const product of candidate.products)
      selected.set(productId(candidate.id, product.productKey), { candidate, product });
    count++;
  }
  for (const [id, { candidate, product }] of selected) {
    const recipe = byOutput.get(product.productKey)!;
    const inputs: ProcessingInput[] = product.inputs.map((input) =>
      input.kind === 'product'
        ? {
            kind: 'product',
            role: input.role,
            foodUse: input.foodUse,
            productId: productId(candidate.id, input.productKey),
          }
        : structuredClone(input),
    );
    const sources: FactSource[] = [
      { kind: 'fact', factId: candidate.roleId },
      { kind: 'map-node', nodeId: candidate.nodeId, property: 'isWater', observedValue: 'false' },
    ];
    for (const input of inputs) {
      if (input.kind === 'product') sources.push({ kind: 'fact', factId: input.productId });
      if (input.kind === 'resource')
        sources.push(
          { kind: 'fact', factId: input.sourceId ?? input.resourceId },
          ...input.depositIds.map((factId) => ({ kind: 'fact' as const, factId })),
        );
    }
    const requirements = [
      ...new Set([
        ...recipe.requirements,
        ...inputs.flatMap((input) =>
          input.kind === 'resource'
            ? (facts.resourceSources.find((source) => source.id === input.sourceId)?.requirements ??
              [])
            : input.kind === 'settlement-water'
              ? [SETTLEMENT_WATER_EXPLANATION]
              : [],
        ),
      ]),
    ];
    facts.products.push({
      id,
      productKey: product.productKey,
      recipeId: recipe.id,
      name: recipe.outputName,
      description: `${candidate.name} could produce ${recipe.outputName.toLowerCase()} by ${recipe.technique}, assuming ${requirements.join(', ') || 'the declared craft capability'}.`,
      origin: 'generated',
      technique: recipe.technique,
      requirements,
      ...(recipe.food ? { food: structuredClone(recipe.food) } : {}),
      ...(recipe.context ? { context: structuredClone(recipe.context) } : {}),
      inputs,
      settlement: { kind: 'embedded', settlementId: candidate.id },
      areaIds: facts.areas
        .filter((area) => area.mapNodeIds.includes(candidate.nodeId))
        .map((area) => area.id)
        .sort(),
      anchor: { nodeIds: [candidate.nodeId], edgeIds: [] },
      reason: {
        ruleId: recipe.id,
        status: 'current',
        sources: [...new Map(sources.map((source) => [JSON.stringify(source), source])).values()],
      },
    });
  }
}
