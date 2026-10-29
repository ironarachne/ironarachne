import { RNG } from '@ironarachne/rng';
import { getProcessingRecipes, type ProcessingRecipe } from '$lib/resources';
import {
  SETTLEMENT_FEATURE_RULES,
  describeSettlementFeatures,
  type Settlement,
  type SettlementFeatureRequirement,
} from '$lib/settlements';
import type Region from './region';
import type { FactReason, FactSource, SettlementRoleFact } from './region_fact_types';
import type { SettlementActivityFact } from './region_activity_types';
import type { PlannedProduct, RegionProcessingCatalog } from './region_processing_types';
import { createProcessingPlanner } from './region_processing_plan';
import { accessibleProcessingResources } from './region_processing_resources';
import { createProcessingEvidenceChecker, reachableProcessingNodes } from './region_evidence';
import { sameSettlement } from './region_livelihood_evidence';
import { resolveActivitySupport } from './region_activity_support';
import { resolveProcessingChain } from './region_processing_chain';
import { processingProductId, recordProcessingPlan } from './region_processing';
import { createRegionEvidenceChecker } from './region_context_evidence';

const crafts = [
  { key: 'craft-linen', output: 'linen', name: 'Linen weaving' },
  { key: 'craft-woven-mats', output: 'woven-mats', name: 'Mat weaving' },
  { key: 'craft-construction-components', output: 'construction-components', name: 'Woodworking' },
  { key: 'craft-dressed-stone', output: 'dressed-stone', name: 'Stone dressing' },
];
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const reference = (factId: string): FactSource => ({ kind: 'fact', factId });
type ActivityRegion = Pick<
  Region,
  | 'facts'
  | 'map'
  | 'environment'
  | 'settlements'
  | 'settlementIds'
  | 'settlementDescriptionReasons'
  | 'affiliation'
>;
type Candidate = {
  key: string;
  name: string;
  productId?: string;
  plan?: PlannedProduct[];
  productionIds: string[];
};

function candidatesAt(
  region: ActivityRegion,
  role: SettlementRoleFact,
  start: number,
  recipes: readonly ProcessingRecipe[],
): Candidate[] {
  const facts = region.facts!;
  const current = createProcessingEvidenceChecker(facts);
  const reached = reachableProcessingNodes(region, start);
  const resources = accessibleProcessingResources(
    region,
    reached,
    role.settlement.kind === 'embedded' ? role.settlement.settlementId : undefined,
  );
  const planner = createProcessingPlanner(recipes, resources);
  const candidates: Candidate[] = [];
  for (const craft of crafts) {
    const existing = [...facts.products]
      .sort((a, b) => lexical(a.id, b.id))
      .find(
        (product) =>
          product.productKey === craft.output &&
          sameSettlement(product.settlement, role.settlement) &&
          resolveActivitySupport(
            facts,
            region.map,
            start,
            role.settlement,
            [{ kind: 'product', productId: product.id }],
            [],
            recipes,
          ) !== null,
      );
    if (existing)
      candidates.push({
        key: craft.key,
        name: craft.name,
        productId: existing.id,
        productionIds: [],
      });
    else {
      const plan = planner(craft.output);
      if (plan.status === 'supported')
        candidates.push({
          key: craft.key,
          name: craft.name,
          plan: plan.products,
          productionIds: [],
        });
    }
  }
  const production = facts.managedProduction
    .filter(
      (entry) =>
        entry.mode === 'cultivation' &&
        sameSettlement(entry.settlement, role.settlement) &&
        current(entry) &&
        entry.anchor.nodeIds.some((id) => reached.has(id)) &&
        resolveActivitySupport(
          facts,
          region.map,
          start,
          role.settlement,
          [],
          [entry.id],
          recipes,
        ) !== null,
    )
    .sort((a, b) => lexical(a.id, b.id));
  if (production.length)
    candidates.push({ key: 'cultivation', name: 'Cultivation', productionIds: [production[0].id] });
  return candidates.sort((a, b) => lexical(a.key, b.key));
}

function activityDescription(region: ActivityRegion, candidate: Candidate): string {
  const facts = region.facts!;
  if (!candidate.productId) return 'Households tend cultivated plots.';
  const chain = resolveProcessingChain(facts, candidate.productId);
  const product = facts.products.find((entry) => entry.id === candidate.productId)!;
  const imports = [
    ...new Set(chain.imports.map((input) => `${input.resourceName} (${input.explanation})`)),
  ];
  const local = [
    ...new Set(
      chain.localInputs.map(
        (input) =>
          facts.resourceSources.find((entry) => entry.id === input.sourceId)?.resource.name ??
          facts.resources.find((entry) => entry.id === input.resourceId)!.name,
      ),
    ),
  ];
  const limited = chain.localInputs.some(
    (input) =>
      (facts.resourceSources.find((entry) => entry.id === input.sourceId)?.availability ??
        facts.resources.find((entry) => entry.id === input.resourceId)?.availability) === 'limited',
  );
  const requirements = [...new Set(chain.products.flatMap((entry) => entry.requirements))];
  return [
    `Households practice ${product.technique}.`,
    local.length
      ? `The work uses ${local.join(', ')} supplied from the region${limited ? ', with limited material availability' : ''}.`
      : '',
    imports.length ? `Inputs brought in from outside are ${imports.join('; ')}.` : '',
    requirements.length ? `The work relies on ${requirements.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Saved occurrence at the site is positive evidence; bounded-list omission remains unknown. */
export function settlementFeatureSources(
  region: ActivityRegion,
  settlement: Settlement,
  role: SettlementRoleFact,
  requirement: SettlementFeatureRequirement,
): FactSource[] | null {
  const facts = region.facts!;
  const current = createRegionEvidenceChecker({
    facts,
    map: region.map,
    environment: region.environment,
  });
  if (requirement.kind === 'activity') {
    const activity = facts.activities.find(
      (entry) =>
        entry.activityKey === requirement.activityKey &&
        sameSettlement(entry.settlement, role.settlement) &&
        entry.support.kind !== 'unknown' &&
        current(entry),
    );
    return activity ? [reference(activity.id)] : null;
  }
  if (requirement.kind === 'geography') {
    if (requirement.predicateKey !== 'riverbank') return null;
    const edge = [...region.map.edges]
      .sort((a, b) => a.id - b.id)
      .find(
        (entry) =>
          (entry.d0 === settlement.mapNodeId || entry.d1 === settlement.mapNodeId) &&
          (entry.river ?? 0) > 0,
      );
    return edge
      ? [
          {
            kind: 'map-edge',
            edgeId: edge.id,
            property: 'river',
            observedValue: String(edge.river),
          },
        ]
      : null;
  }
  const inhabitant = [...facts.ecologyInhabitants]
    .sort((a, b) => lexical(a.id, b.id))
    .find((entry) => {
      const source = requirement.source;
      return (
        entry.source.kind === source.kind &&
        (source.kind === 'plant'
          ? entry.source.kind === 'plant' && entry.source.plantId === source.plantId
          : entry.source.kind === 'species' && entry.source.speciesName === source.speciesName) &&
        current(entry) &&
        entry.habitatIds.some((id) => {
          const habitat = facts.habitats.find((entry) => entry.id === id);
          return (
            habitat &&
            current(habitat) &&
            (habitat.anchor?.nodeIds.includes(settlement.mapNodeId!) ??
              habitat.areaIds.some((id) =>
                facts.areas
                  .find((area) => area.id === id)
                  ?.mapNodeIds.includes(settlement.mapNodeId!),
              ))
          );
        })
      );
    });
  return inhabitant ? [reference(inhabitant.id)] : null;
}

/** Establish bounded household activities, then compose prose from those declarations. */
export function generateSettlementActivities(
  region: ActivityRegion,
  rng: RNG,
  catalog: RegionProcessingCatalog = { recipes: getProcessingRecipes() },
): void {
  const facts = region.facts;
  if (!facts) return;
  const seed = rng.randomString(32);
  region.settlementDescriptionReasons ??= {};
  const sites = region.settlements
    .map((settlement, index) => ({ settlement, index, id: region.settlementIds?.[index] }))
    .filter((entry) => entry.id !== undefined)
    .sort((a, b) => lexical(a.id!, b.id!));
  for (const { settlement, id, index } of sites) {
    const role = [...facts.settlementRoles]
      .sort((a, b) => lexical(a.id, b.id))
      .find(
        (entry) =>
          entry.id.startsWith('role:site:') &&
          entry.settlement.kind === 'embedded' &&
          entry.settlement.settlementId === id &&
          entry.anchor.nodeIds[0] === settlement.mapNodeId &&
          createProcessingEvidenceChecker(facts)(entry),
      );
    const siteValid = region.map.nodes.some(
      (node) => node.id === settlement.mapNodeId && !node.isWater && !node.isOcean,
    );
    if (!role || !siteValid) {
      const words = new RNG(JSON.stringify([seed, id, 'wording']));
      const eligible = SETTLEMENT_FEATURE_RULES.filter((rule) => !rule.requirements.length).map(
        (rule) => rule.id,
      );
      const composed = describeSettlementFeatures(settlement, eligible, words);
      settlement.description = `${settlement.name} is a ${settlement.category.name} of ${new Intl.NumberFormat('en').format(settlement.population)} people. ${composed.text}`;
      region.settlementDescriptionReasons[id!] = {
        ruleId: 'fantasy:region:settlement-description:v1',
        status: 'current',
        sources: [
          {
            kind: 'environment',
            field: 'biome',
            observedValue: JSON.stringify(region.environment.biome),
          },
        ],
      };
      continue;
    }
    const selection = new RNG(JSON.stringify([seed, id, 'activities']));
    const words = new RNG(JSON.stringify([seed, id, 'wording']));
    const candidates = selection.shuffle(
      candidatesAt(region, role, settlement.mapNodeId!, catalog.recipes),
    );
    let count = 0;
    for (const original of candidates) {
      if (count === 2) break;
      const candidate = { ...original };
      if (candidate.plan) {
        const site = {
          id: id!,
          name: settlement.name,
          nodeId: settlement.mapNodeId!,
          roleId: role.id,
        };
        if (!recordProcessingPlan(region, site, candidate.plan, catalog)) continue;
        candidate.productId = processingProductId(
          id!,
          candidate.plan[candidate.plan.length - 1].productKey,
        );
      }
      const inputs = candidate.productId
        ? [{ kind: 'product' as const, productId: candidate.productId }]
        : [];
      const kind = resolveActivitySupport(
        facts,
        region.map,
        settlement.mapNodeId!,
        role.settlement,
        inputs,
        candidate.productionIds,
        catalog.recipes,
      );
      if (!kind) continue;
      const activity: SettlementActivityFact = {
        id: `activity:${encodeURIComponent(id!)}:${candidate.key}`,
        name: candidate.name,
        description: activityDescription(region, candidate),
        origin: 'generated',
        activityKey: candidate.key,
        settlement: role.settlement,
        siteRoleId: role.id,
        areaIds: [...role.areaIds],
        anchor: structuredClone(role.anchor),
        support: { kind, inputs, productionIds: candidate.productionIds },
        reason: {
          ruleId: `fantasy:region:activity:${candidate.key}:v1`,
          status: 'current',
          sources: [
            reference(role.id),
            ...inputs.map((input) => reference(input.productId)),
            ...candidate.productionIds.map(reference),
          ],
        },
      };
      facts.activities.push(activity);
      count++;
    }
    const sources = new Map<string, FactSource[]>();
    for (const rule of SETTLEMENT_FEATURE_RULES) {
      const evidence = rule.requirements.map((requirement) =>
        settlementFeatureSources(region, settlement, role, requirement),
      );
      if (evidence.every((entry) => entry !== null))
        sources.set(
          rule.id,
          evidence.flatMap((entry) => entry!),
        );
    }
    const composed = describeSettlementFeatures(settlement, [...sources.keys()], words);
    settlement.description = `${settlement.name} is a ${settlement.category.name} of ${new Intl.NumberFormat('en').format(settlement.population)} people. ${composed.text}${index === 0 && region.affiliation === 'affiliated' ? ' This is the capital of the region.' : ''}`;
    const reason: FactReason = {
      ruleId: 'fantasy:region:settlement-description:v1',
      status: 'current',
      sources: [reference(role.id), ...composed.ruleIds.flatMap((id) => sources.get(id)!)],
    };
    region.settlementDescriptionReasons[id!] = reason;
  }
}
