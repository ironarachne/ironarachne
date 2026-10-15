import { BiomeClassifications, supportsBiologicalHabitat } from '$lib/environment';
import type { BiologicalSourceDefinition } from '$lib/resources';
import type Region from './region';
import type { ResourceSourceFact } from './region_raw_source_types';
import { biologicalWaterSources } from './region_biological_patches';
import { patchesFor } from './region_ecology';
import { createProcessingEvidenceChecker } from './region_evidence';

/** Live supply qualification only; historical snapshots retain their saved policies and prose. */
export function createAquaticSourceQualifier(region: Pick<Region, 'map' | 'facts'>) {
  const facts = region.facts!;
  const current = createProcessingEvidenceChecker(facts);
  const catalog = { species: [], biomes: BiomeClassifications.getAll() };
  const cached = new Map<string, ReturnType<typeof patchesFor>>();
  return (source: ResourceSourceFact, definition: BiologicalSourceDefinition): number[] => {
    if (source.source.kind !== 'wild' || source.method !== definition.method) return [];
    const inhabitantId = source.source.inhabitantId;
    const inhabitant = facts.ecologyInhabitants.find((entry) => entry.id === inhabitantId);
    if (
      !current(source) ||
      !inhabitant ||
      !current(inhabitant) ||
      inhabitant.source.kind !== 'species' ||
      definition.producer.kind !== 'species' ||
      inhabitant.source.speciesName !== definition.producer.speciesName ||
      inhabitant.occurrenceForm !== definition.wildOccurrenceForm
    )
      return [];
    const eligible = new Set<number>();
    for (const habitatId of source.habitatIds) {
      const habitat = facts.habitats.find((entry) => entry.id === habitatId);
      if (!habitat || !current(habitat) || !inhabitant.habitatIds.includes(habitatId)) continue;
      if (!cached.has(habitatId)) cached.set(habitatId, patchesFor(region, habitat, catalog));
      for (const patch of cached.get(habitatId)!) {
        if (!source.anchor.nodeIds.includes(patch.node.id)) continue;
        const live = biologicalWaterSources(region, patch.node.id);
        const witnessed = live.filter((water) =>
          source.waterSources.some((saved) =>
            water.kind === 'river'
              ? saved.kind === 'river' && saved.edgeId === water.edgeId
              : saved.kind === water.kind && saved.nodeId === water.nodeId,
          ),
        );
        const water = witnessed.flatMap((water) =>
          water.kind === 'river'
            ? ['freshwater-bank' as const]
            : water.kind === 'lake'
              ? ['freshwater-shore' as const]
              : patch.node.isCoast
                ? ['coastal-margin' as const]
                : [],
        );
        if (
          definition.habitats.some(
            (rule) =>
              rule.water !== 'none' &&
              supportsBiologicalHabitat(
                {
                  environments: patch.environments,
                  temperature: patch.node.temperature,
                  moisture: patch.node.moisture,
                  landform: patch.landform,
                  water,
                },
                rule,
              ),
          )
        )
          eligible.add(patch.node.id);
      }
    }
    return [...eligible].sort((a, b) => a - b);
  };
}
