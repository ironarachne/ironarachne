import { createAquaticSourceQualifier } from './region_aquatic_sources';
import { allSpecies } from '$lib/species';
import {
  deriveResourcesFromSpecies,
  getBiologicalSourceDefinitions,
  getGeologicalSourceDefinitions,
  getBuildingMaterialResources,
  getGeologicalResources,
  getPlantProducts,
  type Resource,
} from '$lib/resources';
import type Region from './region';
import type { RegionFacts, ResourceFact, SettlementTarget } from './region_fact_types';
import type { AccessibleProcessingResource, ProcessingInput } from './region_processing_types';
import { createProcessingEvidenceChecker } from './region_evidence';
export { processingEvidenceCurrent, reachableProcessingNodes } from './region_evidence';

function descriptor(fact: ResourceFact, facts: RegionFacts): Resource | undefined {
  const source = fact.catalogSource;
  if (source?.kind === 'geological-resource')
    return getGeologicalResources().find((entry) => entry.resource.name === source.resourceName)
      ?.resource;
  if (source?.kind === 'building-material')
    return getBuildingMaterialResources().find((entry) => entry.name === source.resourceName);
  if (source?.kind === 'plant-product')
    return getPlantProducts(source.plantName).find((entry) => entry.name === source.resourceName);
  if (source?.kind === 'species-product') {
    const species = allSpecies.find((entry) => entry.name === source.speciesName);
    return species
      ? deriveResourcesFromSpecies(species).find((entry) => entry.name === source.resourceName)
      : undefined;
  }
  if (source !== undefined) return undefined;
  if (fact.kind === 'fiber') {
    for (const input of fact.reason?.sources ?? []) {
      if (input.kind !== 'fact') continue;
      const inhabitant = facts.ecologyInhabitants.find(
        (entry) =>
          entry.id === input.factId &&
          entry.category === 'flora' &&
          entry.roles.includes('producer'),
      );
      if (inhabitant?.source.kind === 'described') {
        const product = getPlantProducts(inhabitant.source.label)[0];
        if (product) return product;
      }
    }
    return undefined;
  }
  if (fact.kind !== 'timber' && fact.kind !== 'freshwater') return undefined;
  return {
    name: fact.kind === 'timber' ? 'timber' : 'freshwater',
    description: 'A structured saved source.',
    major_type: fact.kind === 'timber' ? 'wood' : 'water',
    minor_type: fact.kind === 'timber' ? 'timber' : 'freshwater',
    is_refineable: false,
    properties: [],
    commonality: 1,
  };
}
/** Eligible potential sources within the caller's node set; never evidence of delivery or volume. */
export function accessibleProcessingResources(
  region: Pick<Region, 'facts' | 'map'>,
  reached: Set<number>,
  owner?: string | SettlementTarget,
): AccessibleProcessingResource[] {
  const facts = region.facts!;
  const current = createProcessingEvidenceChecker(facts);
  const results: AccessibleProcessingResource[] = [];
  const biological = new Map(getBiologicalSourceDefinitions().map((entry) => [entry.id, entry]));
  const qualifyAquatic = createAquaticSourceQualifier(region);
  const reviewed = new Map(
    [...getBiologicalSourceDefinitions(), ...getGeologicalSourceDefinitions()].map((entry) => [
      entry.id,
      entry.rawResourceId,
    ]),
  );
  for (const fact of [...facts.resources].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  )) {
    if (fact.sourceIds) {
      if (!['available', 'limited'].includes(fact.availability)) continue;
      for (const id of [...fact.sourceIds].sort()) {
        const source = facts.resourceSources.find((entry) => entry.id === id);
        if (!source || !['available', 'limited'].includes(source.availability) || !current(source))
          continue;
        // New generation must recognize the rule; historical saved reads use their snapshots.
        if (
          reviewed.get(source.definitionId) !== source.resource.id ||
          fact.catalogSource?.kind !== 'raw-resource' ||
          fact.catalogSource.resourceId !== source.resource.id
        )
          continue;
        const definition = biological.get(source.definitionId);
        const aquatic =
          definition && ['fishing', 'shellfish-collection'].includes(definition.method);
        const qualifiedNodes = aquatic ? new Set(qualifyAquatic(source, definition)) : undefined;
        if (source.source.kind === 'managed') {
          const production = facts.managedProduction.find(
            (entry) => source.source.kind === 'managed' && entry.id === source.source.productionId,
          );
          const target =
            typeof owner === 'string' ? { kind: 'embedded' as const, settlementId: owner } : owner;
          if (
            !production ||
            (target &&
              (target.kind !== production.settlement.kind ||
                (target.kind === 'embedded'
                  ? production.settlement.kind !== 'embedded' ||
                    target.settlementId !== production.settlement.settlementId
                  : production.settlement.kind !== 'artifact' ||
                    target.targetId !== production.settlement.targetId)))
          )
            continue;
        }
        const deposit =
          source.source.kind === 'deposit'
            ? facts.resourceDeposits.find(
                (entry) => source.source.kind === 'deposit' && entry.id === source.source.depositId,
              )
            : undefined;
        if (
          deposit &&
          (deposit.concentration === 'trace' ||
            deposit.exposure === 'deep' ||
            deposit.extraction === 'drilling')
        )
          continue;
        const nodeIds = source.anchor.nodeIds.filter(
          (id) => reached.has(id) && (!qualifiedNodes || qualifiedNodes.has(id)),
        );
        if (!nodeIds.length) continue;
        const raw = source.resource;
        results.push({
          fact,
          sourceId: source.id,
          rawResourceId: source.resource.id,
          // Reading an edited snapshot may supply reactive proxies; copy the small data union
          // explicitly rather than passing a proxy to structuredClone.
          food:
            source.resource.food.kind === 'food'
              ? { ...source.resource.food, productKeys: [...source.resource.food.productKeys] }
              : { ...source.resource.food },
          sourceAvailability: source.availability,
          acquisitionRequirements: [...source.requirements],
          resource: {
            name: raw.name,
            description: source.description,
            major_type: raw.majorType,
            minor_type: raw.minorType,
            commonality: 1,
            is_refineable: true,
            properties: [],
          },
          depositIds: deposit ? [deposit.id] : [],
          anchor: { nodeIds, edgeIds: [...source.anchor.edgeIds] },
        });
      }
      continue;
    }
    if (!['available', 'limited'].includes(fact.availability) || !current(fact)) continue;
    const resource = descriptor(fact, facts);
    if (!resource) continue;
    let nodeIds = (fact.anchor?.nodeIds ?? []).filter((id) => reached.has(id));
    let depositIds: string[] = [];
    if (fact.depositIds.length) {
      const deposits = facts.resourceDeposits.filter(
        (entry) =>
          fact.depositIds.includes(entry.id) &&
          entry.concentration !== 'trace' &&
          entry.exposure !== 'deep' &&
          entry.extraction !== 'drilling' &&
          current(entry) &&
          entry.anchor.nodeIds.some((id) => nodeIds.includes(id)),
      );
      depositIds = deposits.map((entry) => entry.id).sort();
      nodeIds = nodeIds.filter((id) => deposits.some((entry) => entry.anchor.nodeIds.includes(id)));
      if (!depositIds.length) continue;
    }
    if (!nodeIds.length) continue;
    results.push({
      fact,
      resource,
      depositIds,
      anchor: {
        nodeIds: [...new Set(nodeIds)].sort((a, b) => a - b),
        edgeIds: [...(fact.anchor?.edgeIds ?? [])].sort((a, b) => a - b),
      },
    });
  }
  return results;
}

/** New uses of retained products must pass the same live source checks as new recipes. */
export function processingSourceInputsSupported(
  inputs: ProcessingInput[],
  resources: AccessibleProcessingResource[],
): boolean {
  return inputs.every(
    (input) =>
      input.kind !== 'resource' ||
      !input.sourceId ||
      resources.some(
        (entry) =>
          entry.fact.id === input.resourceId &&
          entry.sourceId === input.sourceId &&
          input.anchor.nodeIds.every((id) => entry.anchor.nodeIds.includes(id)),
      ),
  );
}
