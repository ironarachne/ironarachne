import { assessRawSourceFood, assessRegionProductFood } from './region_food';
import type { RNG } from '@ironarachne/rng';
import type Region from './region';
import type { FactSource, ResourceFact, SettlementRoleFact } from './region_fact_types';
import type {
  DailyLifeCategory,
  DailyLifeInput,
  SettlementDailyLifeFact,
} from './region_livelihood_types';
import {
  accessibleCultivationGround,
  accessibleDailyLifeResources,
  dailyLifeInputCurrent,
  sameSettlement,
} from './region_livelihood_access';
import { processingEvidenceCurrent, reachableProcessingNodes } from './region_processing_resources';

export const DAILY_LIFE_LIMITS: Record<DailyLifeCategory, number> = {
  livelihood: 3,
  staple: 3,
  'building-material': 3,
  fuel: 2,
  craft: 3,
};
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const reference = (factId: string): FactSource => ({ kind: 'fact', factId });
const resourceInput = (
  fact: ResourceFact,
  anchor = fact.anchor!,
  depositIds = fact.depositIds,
  sourceId?: string,
): DailyLifeInput => ({
  kind: 'resource',
  resourceId: fact.id,
  ...(sourceId ? { sourceId } : {}),
  anchor,
  depositIds,
});

function candidatesFor(
  region: Pick<Region, 'facts' | 'map'>,
  role: SettlementRoleFact,
  start: number,
): SettlementDailyLifeFact[] {
  const facts = region.facts!;
  const results: SettlementDailyLifeFact[] = [];
  const add = (
    category: DailyLifeCategory,
    activityKey: string,
    name: string,
    text: string,
    inputs: DailyLifeInput[],
  ) => {
    const sourceIds = inputs.flatMap((input) =>
      input.kind === 'product'
        ? [input.productId]
        : [input.sourceId ?? input.resourceId, ...input.depositIds],
    );
    const limited = inputs.some((input) => {
      if (input.kind === 'resource')
        return (
          (input.sourceId
            ? facts.resourceSources.find((entry) => entry.id === input.sourceId)?.availability
            : facts.resources.find((entry) => entry.id === input.resourceId)?.availability) ===
          'limited'
        );
      // Every raw leaf in a product is checked below; its limited availability is retained in prose.
      return productLimited(input.productId, new Set());
    });
    const id = [role.id, category, activityKey, ...sourceIds].map(encodeURIComponent).join(':');
    results.push({
      id: `daily-life:${id}`,
      name,
      description: `${text}${limited ? ' Local sources are limited.' : ''}`,
      origin: 'generated',
      category,
      activityKey,
      settlement: structuredClone(role.settlement),
      siteRoleId: role.id,
      areaIds: [...role.areaIds].sort(),
      anchor: { nodeIds: [start], edgeIds: [] },
      inputs: structuredClone(inputs),
      reason: {
        ruleId: `fantasy:region:daily-life:${activityKey}:v1`,
        status: 'current',
        sources: [reference(role.id), ...[...new Set(sourceIds)].map(reference)],
      },
    });
  };
  const productLimited = (id: string, seen: Set<string>): boolean => {
    if (seen.has(id)) return false;
    seen.add(id);
    return (
      facts.products
        .find((entry) => entry.id === id)
        ?.inputs.some((input) =>
          input.kind === 'resource'
            ? (input.sourceId
                ? facts.resourceSources.find((entry) => entry.id === input.sourceId)?.availability
                : facts.resources.find((entry) => entry.id === input.resourceId)?.availability) ===
              'limited'
            : input.kind === 'product' && productLimited(input.productId, seen),
        ) ?? false
    );
  };
  const resources = accessibleDailyLifeResources(
    region,
    start,
    role.settlement.kind === 'embedded' ? role.settlement.settlementId : undefined,
  );
  for (const {
    fact,
    resource,
    anchor,
    depositIds,
    sourceId,
    acquisitionRequirements,
  } of resources) {
    const inputs = [resourceInput(fact, anchor, depositIds, sourceId)];
    const label = resource.name;
    const source = facts.resourceSources.find((entry) => entry.id === sourceId);
    if (
      source &&
      assessRawSourceFood(source, (entry) => processingEvidenceCurrent(entry, facts)).status ===
        'eligible'
    ) {
      const assumption = acquisitionRequirements?.length
        ? ` Acquisition requires ${acquisitionRequirements.join(', ')}.`
        : '';
      add(
        'livelihood',
        source.method,
        `${source.method} opportunity`,
        `Local ${label} could be obtained by ${source.method}.${assumption}`,
        inputs,
      );
      add(
        'staple',
        `raw-food-${source.resource.id}`,
        label,
        `${label} is a qualified raw food opportunity; handling and preparation remain necessary.${assumption}`,
        inputs,
      );
    }
    if (fact.kind === 'timber' && resource.major_type === 'wood') {
      add(
        'livelihood',
        'timber-gathering',
        'Timber gathering',
        `Nearby woodland could provide ${label} for gathering.`,
        inputs,
      );
      add(
        'building-material',
        'timber-building',
        label,
        `${label} could provide raw construction material.`,
        inputs,
      );
      add('fuel', 'wood-fuel', `${label} fuel`, `${label} can provide gathered wood fuel.`, inputs);
    }
    if (fact.kind === 'fiber' && resource.major_type === 'plant-fiber') {
      add(
        'livelihood',
        'fiber-gathering',
        'Fiber gathering',
        `${label} could be gathered for local material work.`,
        inputs,
      );
      if (['reed', 'papyrus'].includes(resource.minor_type))
        add(
          'building-material',
          'stem-thatch',
          `${label} thatch`,
          `${label} could supply bundled roofing thatch.`,
          inputs,
        );
    }
    if (
      depositIds.length &&
      ['stone', 'ore', 'gemstone', 'geological-material'].includes(fact.kind)
    ) {
      add(
        'livelihood',
        'raw-extraction',
        `${label} extraction`,
        `Nearby deposits could provide raw ${label}.`,
        inputs,
      );
      if (fact.kind === 'stone' && resource.major_type === 'stone')
        add(
          'building-material',
          'quarry-stone',
          label,
          `Workable raw ${label} could supply building stone.`,
          inputs,
        );
    }
  }
  const water = resources.find((entry) => entry.fact.kind === 'freshwater');
  if (water)
    for (const ground of accessibleCultivationGround(region, start)) {
      const reached = reachableProcessingNodes(region, start);
      add(
        'livelihood',
        'cultivation-opportunity',
        'Possible cultivation',
        'Suitable ground and freshwater offer a possibility for cultivation.',
        [
          resourceInput(ground, {
            nodeIds: ground.anchor!.nodeIds.filter((id) => reached.has(id)).sort((a, b) => a - b),
            edgeIds: [...ground.anchor!.edgeIds].sort((a, b) => a - b),
          }),
          resourceInput(water.fact, water.anchor, water.depositIds),
        ],
      );
    }
  for (const product of [...facts.products].sort((a, b) => lexical(a.id, b.id))) {
    const inputs: DailyLifeInput[] = [{ kind: 'product', productId: product.id }];
    if (
      !sameSettlement(product.settlement, role.settlement) ||
      !dailyLifeInputCurrent(facts, region.map, start, role.settlement, inputs[0])
    )
      continue;
    const capabilities: Record<string, string> = {
      'construction-components': 'Woodworking',
      'woven-mats': 'Mat weaving',
      linen: 'Linen weaving',
      'dressed-stone': 'Stone dressing',
      'iron-tools': 'Basic iron toolmaking',
      'smoked-provisions': 'Food smoking',
      'dried-provisions': 'Food drying',
    };
    const craft = Object.hasOwn(capabilities, product.productKey)
      ? capabilities[product.productKey]
      : undefined;
    if (
      craft &&
      (!['smoked-provisions', 'dried-provisions'].includes(product.productKey) ||
        assessRegionProductFood(facts, product.id, (entry) =>
          processingEvidenceCurrent(entry, facts),
        ).status === 'eligible')
    ) {
      const assumptions = product.requirements.length
        ? `, assuming ${product.requirements.join(', ')}`
        : '';
      const text = `${craft} is plausible household work using ${product.technique}${assumptions}.`;
      add('craft', `craft-${product.productKey}`, craft, text, inputs);
      add('livelihood', `processing-${product.productKey}`, craft, text, inputs);
    }
    if (['sawn-timber', 'construction-components', 'dressed-stone'].includes(product.productKey))
      add(
        'building-material',
        `building-${product.productKey}`,
        product.name,
        `${product.name} is a possible building material through local processing.`,
        inputs,
      );
    if (product.productKey === 'charcoal')
      add(
        'fuel',
        'charcoal-fuel',
        product.name,
        `${product.name} is a possible fuel through wood processing.`,
        inputs,
      );
    if (
      assessRegionProductFood(facts, product.id, (entry) => processingEvidenceCurrent(entry, facts))
        .status === 'eligible'
    )
      add(
        'staple',
        `food-${product.productKey}`,
        product.name,
        `${product.name} is a possible preserved food through local processing.`,
        inputs,
      );
  }
  return results.sort((a, b) => lexical(a.id, b.id));
}

function preferred(role: SettlementRoleFact, fact: SettlementDailyLifeFact): boolean {
  const key = role.reason?.ruleId;
  return (
    (key === 'fantasy:region:forest-settlement:v1' && fact.activityKey === 'timber-gathering') ||
    (key === 'fantasy:region:coastal-port-site:v1' && fact.activityKey === 'fishing') ||
    (key === 'fantasy:region:agricultural-site:v1' &&
      fact.activityKey === 'cultivation-opportunity')
  );
}

/** Choose representative supported ways of living without modifying upstream facts or snapshots. */
export function generateLivelihoodFacts(
  region: Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'>,
  rng: RNG,
): void {
  const facts = region.facts;
  if (!facts) return;
  const sites = region.settlements
    .map((settlement, index) => ({ settlement, id: region.settlementIds?.[index] }))
    .filter((entry) => entry.id !== undefined)
    .sort((a, b) => lexical(a.id!, b.id!));
  for (const { settlement, id } of sites) {
    const start = settlement.mapNodeId;
    if (!region.map.nodes.some((node) => node.id === start && !node.isWater && !node.isOcean))
      continue;
    const role = [...facts.settlementRoles]
      .sort((a, b) => lexical(a.id, b.id))
      .find(
        (entry) =>
          entry.id.startsWith('role:site:') &&
          entry.settlement.kind === 'embedded' &&
          entry.settlement.settlementId === id &&
          entry.anchor.nodeIds.includes(start!) &&
          entry.areaIds.length > 0 &&
          processingEvidenceCurrent(entry, facts),
      );
    if (!role) continue;
    const candidates = candidatesFor(region, role, start!);
    for (const category of Object.keys(DAILY_LIFE_LIMITS) as DailyLifeCategory[]) {
      const pool = candidates.filter((entry) => entry.category === category);
      // One entry per activity/source family keeps three hunted species from crowding out other livelihoods.
      const chosen: SettlementDailyLifeFact[] = [];
      const priority = pool.find((entry) => preferred(role, entry));
      if (priority) chosen.push(priority);
      for (const entry of rng.shuffle(pool)) {
        if (chosen.length === DAILY_LIFE_LIMITS[category]) break;
        if (
          category === 'livelihood' &&
          chosen.some((other) => other.activityKey === entry.activityKey)
        )
          continue;
        if (!chosen.some((other) => other.id === entry.id)) chosen.push(entry);
      }
      facts.dailyLife.push(...chosen.sort((a, b) => lexical(a.id, b.id)));
    }
  }
}
