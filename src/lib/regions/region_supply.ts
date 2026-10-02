import type { RNG } from '@ironarachne/rng';
import {
  getProcessingRecipes,
  type RecipeInputSelector,
  type ProcessingRecipe,
} from '$lib/resources';
import type Region from './region';
import type { SettlementRoleFact } from './region_fact_types';
import type { ProcessingCapability, SettlementSupplyFact, SupplyNeed } from './region_supply_types';
import type { AccessibleProcessingResource } from './region_processing_types';
import { accessibleProcessingResources } from './region_processing_resources';
import { processingEvidenceCurrent, reachableProcessingNodes } from './region_evidence';
import { assessProcessingCapability, assessRawCapability } from './region_processing_capability';
import { dailyLifeInputCurrent, sameSettlement } from './region_livelihood_evidence';
import { resolveProcessingChain } from './region_processing_chain';
import { supplyInventoryCurrent } from './region_supply_evidence';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const raw = (majorType: string): RecipeInputSelector => ({
  kind: 'raw',
  majorType,
  minorTypes: [],
  resourceNames: [],
});
const needs: SupplyNeed[] = [
  {
    key: 'construction-timber',
    use: 'wooden construction',
    name: 'Construction timber',
    selector: raw('wood'),
    outputs: ['sawn-timber', 'construction-components'],
    consequence:
      'Wooden construction would depend on bringing timber in; other supported building materials remain alternatives.',
  },
  {
    key: 'wood-fuel',
    use: 'wood-fired heating and household processing',
    name: 'Wood fuel',
    selector: raw('wood'),
    outputs: ['charcoal'],
    consequence: 'Wood-fired heating and household processing would depend on bringing fuel in.',
  },
  {
    key: 'building-stone',
    use: 'stone construction',
    name: 'Building stone',
    selector: raw('stone'),
    outputs: ['dressed-stone'],
    consequence:
      'Stone construction would depend on brought-in stone; other supported building materials remain alternatives.',
  },
  {
    key: 'woven-cloth',
    use: 'clothing and cloth work',
    name: 'Woven cloth',
    outputs: ['linen'],
    consequence: 'Clothing and cloth work would depend on brought-in cloth if used.',
  },
  {
    key: 'iron-tools',
    use: 'household crafts using iron tools',
    name: 'Simple iron tools',
    outputs: ['iron-tools'],
    consequence: 'Household crafts using iron tools would depend on brought-in tools.',
  },
  {
    key: 'preserved-provisions',
    use: 'food preservation',
    name: 'Preserved provisions',
    outputs: ['dried-provisions', 'smoked-provisions'],
    consequence:
      'Stored provisions would need to be brought in if used. This is an incomplete food picture, not proof that people lack food.',
  },
];

function bestCapability(options: ProcessingCapability[]): ProcessingCapability {
  return (
    options.find((option) => option.supported && !option.limited) ??
    options.find((option) => option.supported) ?? {
      supported: false,
      limited: false,
      depth: 0,
      resourceIds: [...new Set(options.flatMap((option) => option.resourceIds))].sort(),
      missingInputKeys: [...new Set(options.flatMap((option) => option.missingInputKeys))].sort(),
    }
  );
}

function assessNeed(
  region: Pick<Region, 'facts' | 'map'>,
  role: SettlementRoleFact,
  need: SupplyNeed,
  resources: AccessibleProcessingResource[],
  recipes: ProcessingRecipe[],
): ProcessingCapability {
  const facts = region.facts!;
  const start = role.anchor.nodeIds[0];
  const options = need.outputs.map((output) =>
    assessProcessingCapability(recipes, resources, output),
  );
  if (need.selector) options.unshift(assessRawCapability(resources, need.selector));
  // Saved authored local chains remain evidence even if their recipe is no longer in the catalog.
  for (const product of [...facts.products].sort((a, b) => lexical(a.id, b.id))) {
    if (
      !need.outputs.includes(product.productKey) ||
      !sameSettlement(product.settlement, role.settlement) ||
      !dailyLifeInputCurrent(facts, region.map, start, role.settlement, {
        kind: 'product',
        productId: product.id,
      })
    )
      continue;
    const chain = resolveProcessingChain(facts, product.id);
    const ids = chain.localInputs.map((input) => input.resourceId);
    options.push({
      supported: true,
      limited: ids.some(
        (id) => facts.resources.find((entry) => entry.id === id)?.availability === 'limited',
      ),
      resourceIds: ids,
      missingInputKeys: [],
      depth: 0,
    });
  }
  return bestCapability(options);
}

function missingInputLabels(recipes: ProcessingRecipe[]): Map<string, string> {
  return new Map(
    [
      ...recipes.flatMap((recipe) => recipe.inputs.map(({ selector }) => selector)),
      ...needs.flatMap((need) => (need.selector ? [need.selector] : [])),
    ].flatMap((selector) =>
      selector.kind === 'raw'
        ? [
            [
              JSON.stringify(selector),
              selector.resourceNames.join(' or ') ||
                ({
                  organic: 'represented meat or fish',
                  wood: 'timber',
                  water: 'freshwater',
                  stone: 'workable building stone',
                }[selector.majorType] ??
                  selector.majorType),
            ] as const,
          ]
        : [],
    ),
  );
}

function importedSupport(
  region: Pick<Region, 'facts' | 'map'>,
  role: SettlementRoleFact,
  need: SupplyNeed,
): string {
  const facts = region.facts!;
  const inputs = facts.products
    .filter(
      (product) =>
        need.outputs.includes(product.productKey) &&
        sameSettlement(product.settlement, role.settlement),
    )
    .flatMap((product) => {
      const chain = resolveProcessingChain(facts, product.id);
      if (
        chain.issues.length ||
        !chain.products.every((entry) => sameSettlement(entry.settlement, role.settlement)) ||
        !chain.localInputs.every((input) =>
          dailyLifeInputCurrent(facts, region.map, role.anchor.nodeIds[0], role.settlement, input),
        )
      )
        return [];
      return chain.imports.map((input) => input.resourceName);
    });
  const names = [...new Set(inputs)].sort();
  return names.length
    ? ` The saved production chain depends on imported ${names.join(', ')}; it does not establish a wholly local supply.`
    : '';
}

/** Evaluate the full inventory and recipe possibilities, including products omitted by selection. */
export function assessSettlementSupply(
  region: Pick<Region, 'facts' | 'map'>,
  role: SettlementRoleFact,
): SettlementSupplyFact[] {
  const facts = region.facts;
  const start = role.anchor.nodeIds[0];
  if (
    !facts ||
    !supplyInventoryCurrent(facts) ||
    !processingEvidenceCurrent(role, facts) ||
    !role.areaIds.length ||
    !region.map.nodes.some((node) => node.id === start && !node.isWater && !node.isOcean)
  )
    return [];
  const resources = accessibleProcessingResources(region, reachableProcessingNodes(region, start));
  const regional = accessibleProcessingResources(
    region,
    new Set(region.map.nodes.map((node) => node.id)),
  );
  const recipes = getProcessingRecipes();
  const labels = missingInputLabels(recipes);
  const resourceIds = facts.resources.map((entry) => entry.id).sort();
  const productIds = facts.products.map((entry) => entry.id).sort();
  const results: SettlementSupplyFact[] = [];
  for (const need of needs) {
    const assessment = assessNeed(region, role, need, resources, recipes);
    if (assessment.supported && !assessment.limited) continue;
    const status = assessment.supported ? 'limited-local' : 'local-not-supported';
    // A region-wide inventory establishes represented raw inputs, not a reachable supplier.
    const regionalInputsRepresented = need.selector
      ? assessRawCapability(regional, need.selector).supported
      : need.outputs.some(
          (output) => assessProcessingCapability(recipes, regional, output).supported,
        );
    const missing = assessment.missingInputKeys
      .map((key) => labels.get(key) ?? 'a declared processing capability')
      .join(', ');
    const limitation = assessment.supported
      ? `${need.name} can be supplied locally, but its recorded raw inputs have limited supply. This can constrain ${need.use}.`
      : `${need.name} has no supported local provision at this site under the saved inventory and craft policy. ${
          regionalInputsRepresented
            ? need.selector
              ? 'Represented regional supply is outside supported access at this site; this is not regional absence.'
              : 'Required raw inputs are represented regionally, but no complete accessible local chain is established here. Regional production and transport are not established.'
            : `The recorded accessible sources do not complete the required supply${missing ? `; missing supported inputs include ${missing}` : ''}. Deposits requiring unsupported extraction do not establish usable supply.`
        } ${need.consequence}`;
    const explanation = assessment.supported
      ? `Bringing in ${need.name.toLowerCase()} could supplement the limited local supply.`
      : `${need.name} would need to be brought in if used; no supplier or transport route is established.`;
    results.push({
      id: `supply:${encodeURIComponent(role.id)}:${need.key}`,
      needKey: need.key,
      name: need.name,
      description: `${limitation}${importedSupport(region, role, need)} ${explanation}`,
      origin: 'generated',
      status,
      settlement: structuredClone(role.settlement),
      siteRoleId: role.id,
      areaIds: [...role.areaIds].sort(),
      anchor: { nodeIds: [start], edgeIds: [] },
      resourceIds: [...resourceIds],
      productIds: [...productIds],
      missingInputKeys: assessment.missingInputKeys,
      importSuggestion: { goodName: need.name, explanation },
      reason: {
        ruleId: `fantasy:region:supply:${need.key}:v1`,
        status: 'current',
        sources: [role.id, ...resourceIds, ...productIds].map((factId) => ({
          kind: 'fact',
          factId,
        })),
      },
    });
  }
  return results.sort((a, b) => lexical(a.id, b.id));
}

/** Choose a few consequential limitations on an isolated stream without creating commerce. */
export function generateSupplyFacts(
  region: Pick<Region, 'facts' | 'map' | 'settlements' | 'settlementIds'>,
  rng: RNG,
): void {
  if (!region.facts) return;
  const sites = region.settlements
    .map((settlement, index) => ({ settlement, id: region.settlementIds?.[index] }))
    .sort((a, b) => lexical(a.id ?? '', b.id ?? ''));
  for (const { settlement, id } of sites) {
    if (!id) continue;
    const role = [...region.facts.settlementRoles]
      .sort((a, b) => lexical(a.id, b.id))
      .find(
        (entry) =>
          entry.id.startsWith('role:site:') &&
          entry.settlement.kind === 'embedded' &&
          entry.settlement.settlementId === id &&
          entry.anchor.nodeIds[0] === settlement.mapNodeId &&
          processingEvidenceCurrent(entry, region.facts!),
      );
    if (!role) continue;
    region.facts.supply.push(
      ...rng
        .shuffle(assessSettlementSupply(region, role))
        .slice(0, 3)
        .sort((a, b) => lexical(a.id, b.id)),
    );
  }
}
