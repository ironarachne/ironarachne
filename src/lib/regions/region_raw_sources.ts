import { BiomeClassifications, supportsBiologicalHabitat } from '$lib/environment';
import { allSpecies } from '$lib/species';
import {
  getBiologicalSourceDefinitions,
  getBiologicalRawResources,
  getGeologicalSourceDefinitions,
  getGeologicalRawResources,
  snapshotRawResource,
  type RawResourceDefinition,
} from '$lib/resources';
import type Region from './region';
import type { ResourceCandidate } from './region_resource_rule_types';
import type { ResourceKind } from './region_fact_types';
import type { ResourceSourceFact } from './region_raw_source_types';
import { patchesFor } from './region_ecology';
import { biologicalPatch, biologicalWaterSources } from './region_biological_patches';
import { processingEvidenceCurrent } from './region_evidence';
import { depositKinds } from './region_resource_constants';

function biologicalKind(
  raw: RawResourceDefinition,
  producerKind: 'plant' | 'species',
  aquatic: boolean,
): ResourceKind {
  if (raw.uses.includes('food')) return aquatic ? 'fish' : 'food';
  if (['plant-fiber', 'animal-fiber'].includes(raw.resource.major_type)) return 'fiber';
  return producerKind === 'species' ? 'animal-material' : 'plant-material';
}
/** Inventory summaries are projections of retained, independently qualified source facts. */
export function rawSourceCandidates(
  sources: ResourceSourceFact[],
  kinds: Map<string, ResourceKind>,
): ResourceCandidate[] {
  const groups = new Map<string, ResourceSourceFact[]>();
  for (const source of sources.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const group = groups.get(source.resource.id) ?? [];
    if (group.length < 4) group.push(source);
    groups.set(source.resource.id, group);
  }
  return [...groups].map(([id, entries]) => {
    const first = entries[0];
    return {
      sourceFacts: entries,
      supportIds: new Set(entries.map((entry) => entry.id)),
      sources: entries.map((entry) => ({ kind: 'fact' as const, factId: entry.id })),
      fact: {
        id: `resource:raw:${id}`,
        name: first.resource.name,
        description: `Potential raw ${first.resource.name}; acquisition requires ${[...new Set(entries.flatMap((entry) => entry.requirements))].join(', ')}.`,
        origin: 'generated' as const,
        kind: kinds.get(id)!,
        availability: entries.some((entry) => entry.availability === 'available')
          ? ('available' as const)
          : ('limited' as const),
        catalogSource: { kind: 'raw-resource' as const, resourceId: id },
        sourceIds: entries.map((entry) => entry.id),
        areaIds: [...new Set(entries.flatMap((entry) => entry.areaIds))].sort(),
        habitatIds: [...new Set(entries.flatMap((entry) => entry.habitatIds))].sort(),
        depositIds: [
          ...new Set(
            entries.flatMap((entry) =>
              entry.source.kind === 'deposit' ? [entry.source.depositId] : [],
            ),
          ),
        ].sort(),
        anchor: {
          nodeIds: [...new Set(entries.flatMap((entry) => entry.anchor.nodeIds))].sort(
            (a, b) => a - b,
          ),
          edgeIds: [...new Set(entries.flatMap((entry) => entry.anchor.edgeIds))].sort(
            (a, b) => a - b,
          ),
        },
      },
    };
  });
}
export function biologicalSourceCandidates(
  region: Pick<Region, 'facts' | 'map'>,
  managed = false,
): ResourceCandidate[] {
  const facts = region.facts!;
  const definitions = getBiologicalSourceDefinitions().filter(
    (entry) => (entry.mode !== 'wild') === managed,
  );
  const raws = getBiologicalRawResources();
  const sources: ResourceSourceFact[] = [];
  const habitatPatches = new Map(
    facts.habitats.map((habitat) => [
      habitat.id,
      patchesFor(region, habitat, {
        species: allSpecies,
        biomes: BiomeClassifications.getAll(),
      }).map((patch) => ({ patch, observed: biologicalPatch(region, patch) })),
    ]),
  );
  for (const definition of definitions) {
    const origins = managed
      ? facts.managedProduction
          .filter(
            (entry) =>
              entry.mode === definition.mode &&
              JSON.stringify(entry.producer) === JSON.stringify(definition.producer),
          )
          .map((entry) => ({
            id: entry.id,
            habitatIds: entry.habitatIds,
            nodeIds: entry.anchor.nodeIds,
            source: { kind: 'managed' as const, productionId: entry.id },
          }))
      : facts.ecologyInhabitants
          .filter(
            (entry) =>
              JSON.stringify(entry.source) === JSON.stringify(definition.producer) &&
              entry.occurrenceForm === definition.wildOccurrenceForm,
          )
          .map((entry) => ({
            id: entry.id,
            habitatIds: entry.habitatIds,
            nodeIds: null,
            source: { kind: 'wild' as const, inhabitantId: entry.id },
          }));
    for (const origin of origins) {
      const evidence = managed
        ? facts.managedProduction.find((entry) => entry.id === origin.id)!
        : facts.ecologyInhabitants.find((entry) => entry.id === origin.id)!;
      if (!processingEvidenceCurrent(evidence, facts)) continue;
      for (const habitat of [...facts.habitats]
        .sort((a, b) => (a.id < b.id ? -1 : 1))
        .filter((entry) => origin.habitatIds.includes(entry.id))) {
        const patches = habitatPatches
          .get(habitat.id)!
          .filter(
            ({ patch, observed }) =>
              (!origin.nodeIds || origin.nodeIds.includes(patch.node.id)) &&
              definition.habitats.some((rule) => supportsBiologicalHabitat(observed, rule)),
          )
          .map(({ patch }) => patch);
        for (const patch of patches.slice(0, 1)) {
          const raw = raws.find((entry) => entry.id === definition.rawResourceId)!;
          sources.push({
            id: `resource-source:${encodeURIComponent(definition.id)}:${encodeURIComponent(origin.id)}:${patch.node.id}`,
            name: `${raw.resource.name} source`,
            description: definition.reviewNote,
            origin: 'generated',
            definitionId: definition.id,
            resource: snapshotRawResource(raw),
            source: origin.source,
            method: definition.method,
            requirements: [...definition.requirements],
            availability: 'limited',
            areaIds: facts.areas
              .filter((entry) => entry.mapNodeIds.includes(patch.node.id))
              .map((entry) => entry.id)
              .sort(),
            habitatIds: [habitat.id],
            anchor: { nodeIds: [patch.node.id], edgeIds: [] },
            waterSources: biologicalWaterSources(region, patch.node.id),
            reason: {
              ruleId: definition.id,
              status: 'current',
              sources: [
                { kind: 'fact', factId: origin.id },
                { kind: 'fact', factId: habitat.id },
                {
                  kind: 'map-node',
                  nodeId: patch.node.id,
                  property: 'temperature',
                  observedValue: String(patch.node.temperature),
                },
                {
                  kind: 'map-node',
                  nodeId: patch.node.id,
                  property: 'moisture',
                  observedValue: String(patch.node.moisture),
                },
              ],
            },
          });
        }
      }
    }
  }
  return rawSourceCandidates(
    sources,
    new Map(
      raws.map((raw) => [
        raw.id,
        biologicalKind(
          raw,
          definitions.find((entry) => entry.rawResourceId === raw.id)?.producer.kind ?? 'plant',
          definitions.some(
            (entry) =>
              entry.rawResourceId === raw.id &&
              ['fishing', 'shellfish-collection'].includes(entry.method),
          ),
        ),
      ]),
    ),
  );
}
export function geologicalSourceCandidates(region: Pick<Region, 'facts'>): ResourceCandidate[] {
  const facts = region.facts!;
  const raws = getGeologicalRawResources();
  const kinds = new Map<string, ResourceKind>();
  const sources: ResourceSourceFact[] = [];
  const definitions = getGeologicalSourceDefinitions();
  for (const deposit of facts.resourceDeposits) {
    if (deposit.concentration === 'trace' || !processingEvidenceCurrent(deposit, facts)) continue;
    const definition = definitions.find(
      (entry) => entry.occurrence.resource.name === deposit.resourceName,
    );
    if (!definition) continue;
    const raw = raws.find((entry) => entry.id === definition.rawResourceId)!;
    kinds.set(raw.id, depositKinds[deposit.category]);
    const province = facts.geology.find((entry) => entry.id === deposit.geologyId)!;
    sources.push({
      id: `resource-source:${encodeURIComponent(deposit.id)}`,
      name: `${raw.resource.name} source`,
      description: definition.reviewNote,
      origin: 'generated',
      definitionId: definition.id,
      resource: snapshotRawResource(raw),
      source: { kind: 'deposit', depositId: deposit.id },
      method: deposit.extraction,
      requirements: [...definition.requirements],
      availability: deposit.concentration === 'rich' ? 'available' : 'limited',
      areaIds: [...province.areaIds],
      habitatIds: [],
      anchor: structuredClone(deposit.anchor),
      waterSources: [],
      reason: {
        ruleId: definition.id,
        status: 'current',
        sources: [{ kind: 'fact', factId: deposit.id }],
      },
    });
  }
  return rawSourceCandidates(sources, kinds);
}
