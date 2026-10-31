import {
  architectureResourcesFromCatalog,
  type ArchitectureResources,
  type ArchitectureResourceInput,
  type MaterialForm,
} from '$lib/architecture';
import { getProcessingRecipes, type Resource } from '$lib/resources';
import { generateSettlementArchitecture } from '$lib/settlements';
import type Region from './region';
import type { SettlementTarget } from './region_fact_types';
import { settlementDailyLifeContext } from './region_livelihood_presentation';
import {
  dailyLifeEvidenceCurrent,
  dailyLifeInputCurrent,
  sameSettlement,
} from './region_livelihood_evidence';
import { regionContextEvidenceCurrent } from './region_context_evidence';
import {
  accessibleProcessingResources,
  reachableProcessingNodes,
} from './region_processing_resources';
import { resolveProcessingChain } from './region_processing_chain';

const PRODUCT_MATERIALS: Record<string, { major: string; forms: MaterialForm[] }> = {
  'sawn-timber': { major: 'wood', forms: ['timber', 'board'] },
  'construction-components': { major: 'wood', forms: ['timber'] },
  'reed-thatch': { major: 'thatch', forms: ['thatch'] },
  'wood-shingles': { major: 'wood', forms: ['board'] },
  'slate-roofing': { major: 'stone', forms: ['tile'] },
  'dressed-stone': { major: 'stone', forms: ['block'] },
  'fired-bricks': { major: 'brick', forms: ['brick'] },
  'clay-roof-tiles': { major: 'ceramic', forms: ['tile'] },
  'woven-mats': { major: 'plant-fiber', forms: ['woven'] },
};
/** Current, attributed construction evidence; presentation strings never become generation inputs. */
export function regionArchitectureResources(
  region: Pick<Region, 'facts' | 'map' | 'environment'>,
  target: SettlementTarget,
): ArchitectureResources {
  const facts = region.facts;
  if (!facts || facts.state !== 'current') return { knowledge: 'unknown', entries: [] };
  const assertions = settlementDailyLifeContext(facts, target)['building-material'];
  if (!assertions.length) return { knowledge: 'unknown', entries: [] };
  const entries = new Map<string, ArchitectureResourceInput>();
  const recipes = getProcessingRecipes();
  for (const fact of assertions) {
    const role = facts.settlementRoles.find((r) => r.id === fact.siteRoleId);
    const start = role?.anchor.nodeIds[0];
    if (
      start === undefined ||
      !role ||
      !sameSettlement(role.settlement, target) ||
      !dailyLifeEvidenceCurrent(facts, fact) ||
      !regionContextEvidenceCurrent({ ...region, facts }, fact) ||
      !fact.inputs.every((i) => dailyLifeInputCurrent(facts, region.map, start, target, i))
    )
      return { knowledge: 'unknown', entries: [] };
    const accessible = accessibleProcessingResources(
      region,
      reachableProcessingNodes(region, start),
      target,
    );
    for (const input of fact.inputs) {
      if (input.kind === 'resource') {
        const candidate = accessible.find(
          (c) =>
            c.fact.id === input.resourceId && (!input.sourceId || c.sourceId === input.sourceId),
        );
        if (!candidate) continue;
        const normalized = architectureResourcesFromCatalog([candidate.resource]);
        const entry = normalized.entries[0];
        entries.set(candidate.fact.id, {
          ...entry,
          id: candidate.fact.id,
          availability:
            candidate.sourceAvailability === 'limited' || candidate.fact.availability === 'limited'
              ? 'limited'
              : 'available',
          evidenceIds: [
            fact.id,
            candidate.fact.id,
            ...(candidate.sourceId ? [candidate.sourceId] : []),
          ],
        });
      } else {
        const chain = resolveProcessingChain(facts, input.productId);
        if (chain.issues.length || chain.imports.length) continue;
        for (const product of chain.products) {
          const mapping = PRODUCT_MATERIALS[product.productKey];
          const recipe = recipes.find((r) => r.outputKey === product.productKey);
          if (!mapping || !recipe) continue;
          const limited = chain.localInputs.some(
            (i) => facts.resources.find((r) => r.id === i.resourceId)?.availability === 'limited',
          );
          for (const form of mapping.forms) {
            const id = `${product.id}:${form}`;
            const resource: Resource = {
              name: recipe.outputName,
              description: '',
              major_type: mapping.major,
              minor_type: product.productKey,
              is_refineable: false,
              commonality: 1,
              properties: [],
            };
            entries.set(id, {
              id,
              resource,
              form,
              availability: limited ? 'limited' : 'available',
              origin: 'local',
              evidenceIds: [fact.id, product.id, ...chain.localInputs.map((i) => i.resourceId)],
            });
          }
        }
      }
    }
  }
  return {
    knowledge: 'known',
    entries: [...entries.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
  };
}
export function generateRegionArchitecture(region: Region, seed: string): void {
  region.settlements = region.settlements.map((settlement, index) => {
    const id = region.settlementIds?.[index] ?? `settlement:${index + 1}`;
    const resources = regionArchitectureResources(region, { kind: 'embedded', settlementId: id });
    return {
      ...settlement,
      architecture: generateSettlementArchitecture(settlement, {
        seed: JSON.stringify([seed, 'architecture', id]),
        resources,
      }),
    };
  });
}
