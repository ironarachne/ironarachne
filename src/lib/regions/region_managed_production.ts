import type { RNG } from '@ironarachne/rng';
import {
  BiomeClassifications,
  getPlantDefinitions,
  supportsBiologicalHabitat,
} from '$lib/environment';
import { allSpecies } from '$lib/species';
import { getManagedProductionRules } from '$lib/resources';
import type Region from './region';
import { patchesFor } from './region_ecology';
import { biologicalPatch } from './region_biological_patches';
import { processingEvidenceCurrent, reachableProcessingNodes } from './region_evidence';
import { biologicalSourceCandidates } from './region_raw_sources';
import { resourceKinds } from './region_resource_constants';

/** Uses the frozen unmanaged inventory; generated fields and animals never feed one another. */
export function generateManagedProduction(
  region: Pick<Region, 'map' | 'facts' | 'settlements' | 'settlementIds' | 'environment'>,
  rng: RNG,
): void {
  const facts = region.facts!;
  const rules = getManagedProductionRules();
  const plants = getPlantDefinitions();
  const habitatPatches = new Map(
    facts.habitats
      .filter((habitat) => processingEvidenceCurrent(habitat, facts))
      .map((habitat) => [
        habitat.id,
        patchesFor(region, habitat, {
          species: allSpecies,
          biomes: BiomeClassifications.getAll(),
        }).map((patch) => ({ patch, observed: biologicalPatch(region, patch) })),
      ]),
  );
  for (const { index, settlement } of region.settlements
    .map((settlement, index) => ({ settlement, index }))
    .sort((a, b) =>
      (region.settlementIds?.[a.index] ?? '') < (region.settlementIds?.[b.index] ?? '') ? -1 : 1,
    )) {
    if (facts.managedProduction.length >= 8) break;
    const settlementId = region.settlementIds?.[index];
    if (!settlementId || settlement.mapNodeId === undefined) continue;
    const reached = reachableProcessingNodes(region, settlement.mapNodeId);
    const support = facts.resources.filter(
      (entry) =>
        ['available', 'limited'].includes(entry.availability) &&
        processingEvidenceCurrent(entry, facts) &&
        entry.anchor?.nodeIds.some((id) => reached.has(id)),
    );
    const freshwater = support.find((entry) => entry.kind === 'freshwater');
    if (!freshwater) continue;
    const candidates = rules.flatMap((rule) => {
      if (
        rule.mode === 'cultivation' &&
        !rule.soilTypes.some((soil) =>
          region.environment.terrain.geologicalMakeup.soilTypes.includes(soil),
        )
      )
        return [];
      return [...facts.habitats]
        .sort((a, b) => (a.id < b.id ? -1 : 1))
        .flatMap((habitat) =>
          (habitatPatches.get(habitat.id) ?? [])
            .filter(
              ({ patch, observed }) =>
                reached.has(patch.node.id) &&
                rule.habitats.some((entry) => supportsBiologicalHabitat(observed, entry)),
            )
            .map(({ patch }) => patch)
            .flatMap((patch) => {
              const ground = support.find(
                (entry) =>
                  entry.kind === 'arable-land' && entry.anchor?.nodeIds.includes(patch.node.id),
              );
              if (rule.supportRequirements.includes('cultivable-ground') && !ground) return [];
              const forage = rule.supportRequirements.includes('grazing')
                ? 'grazing'
                : rule.supportRequirements.includes('flowering-forage')
                  ? 'flowering'
                  : null;
              const inhabitant = forage
                ? facts.ecologyInhabitants.find(
                    (entry) =>
                      entry.source.kind === 'plant' &&
                      plants.some(
                        (plant) =>
                          entry.source.kind === 'plant' &&
                          plant.id === entry.source.plantId &&
                          plant.forage.includes(forage),
                      ) &&
                      entry.habitatIds.includes(habitat.id) &&
                      processingEvidenceCurrent(entry, facts),
                  )
                : undefined;
              if (forage && !inhabitant) return [];
              return [
                {
                  rule,
                  habitat,
                  patch,
                  resourceIds: [freshwater.id, ...(ground ? [ground.id] : [])],
                  inhabitantIds: inhabitant ? [inhabitant.id] : [],
                },
              ];
            }),
        );
    });
    candidates.sort((a, b) =>
      a.rule.id < b.rule.id ? -1 : a.rule.id > b.rule.id ? 1 : a.patch.node.id - b.patch.node.id,
    );
    const chosen = rng.shuffle(candidates);
    const producers = new Set<string>();
    for (const candidate of chosen) {
      if (producers.size >= 2 || facts.managedProduction.length >= 8) break;
      if (producers.has(candidate.rule.id)) continue;
      producers.add(candidate.rule.id);
      const { rule, habitat, patch, resourceIds, inhabitantIds } = candidate;
      const name =
        rule.producer.kind === 'plant'
          ? plants.find(
              (plant) => plant.id === (rule.producer.kind === 'plant' ? rule.producer.plantId : ''),
            )!.label
          : rule.producer.speciesName;
      facts.managedProduction.push({
        id: `managed-production:${encodeURIComponent(settlementId)}:${encodeURIComponent(rule.id)}`,
        name: `${name} ${rule.mode}`,
        description: `A modeled ${rule.mode} opportunity owned by ${settlement.name}; no harvest quantity or craft capability is established.`,
        origin: 'generated',
        producer: structuredClone(rule.producer),
        mode: rule.mode,
        productionRuleId: rule.id,
        settlement: { kind: 'embedded', settlementId },
        areaIds: facts.areas
          .filter((entry) => entry.mapNodeIds.includes(patch.node.id))
          .map((entry) => entry.id)
          .sort(),
        habitatIds: [habitat.id],
        anchor: { nodeIds: [patch.node.id], edgeIds: [] },
        supportingResourceIds: resourceIds,
        supportingInhabitantIds: inhabitantIds,
        reason: {
          ruleId: rule.id,
          status: 'current',
          sources: [habitat.id, ...resourceIds, ...inhabitantIds].map((factId) => ({
            kind: 'fact',
            factId,
          })),
        },
      });
    }
  }
}
/** Preserve early settlement support, then add bounded managed supply. */
export function finalizeResourceInventory(region: Pick<Region, 'facts' | 'map'>, rng: RNG): void {
  const facts = region.facts!;
  const candidates = biologicalSourceCandidates(region, true);
  for (const kind of resourceKinds) {
    const selected = rng.shuffle(candidates.filter((entry) => entry.fact.kind === kind));
    for (const candidate of selected) {
      const existing = facts.resources.find((entry) => entry.id === candidate.fact.id);
      if (existing) {
        const room = 4 - (existing.sourceIds?.length ?? 0);
        const sources = candidate.sourceFacts!.slice(0, room);
        facts.resourceSources.push(...sources);
        existing.sourceIds!.push(...sources.map((entry) => entry.id));
        existing.reason!.sources.push(
          ...sources.map((entry) => ({ kind: 'fact' as const, factId: entry.id })),
        );
        existing.areaIds = [
          ...new Set([...existing.areaIds, ...sources.flatMap((entry) => entry.areaIds)]),
        ].sort();
        existing.habitatIds = [
          ...new Set([...existing.habitatIds, ...sources.flatMap((entry) => entry.habitatIds)]),
        ].sort();
        existing.anchor!.nodeIds = [
          ...new Set([
            ...existing.anchor!.nodeIds,
            ...sources.flatMap((entry) => entry.anchor.nodeIds),
          ]),
        ].sort((a, b) => a - b);
      } else if (
        facts.resources.filter(
          (entry) => entry.kind === kind && ['available', 'limited'].includes(entry.availability),
        ).length < 3
      ) {
        facts.resources = facts.resources.filter(
          (entry) => entry.kind !== kind || !entry.id.startsWith('resource:assessment:'),
        );
        candidate.fact.reason = {
          ruleId: 'fantasy:region:raw-resource:v2',
          status: 'current',
          sources: candidate.sources,
        };
        facts.resources.push(candidate.fact);
        facts.resourceSources.push(...candidate.sourceFacts!);
      }
    }
  }
  facts.managedProduction = facts.managedProduction.filter((production) =>
    facts.resourceSources.some(
      (source) => source.source.kind === 'managed' && source.source.productionId === production.id,
    ),
  );
}
