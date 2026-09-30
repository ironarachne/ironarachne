import type { RNG } from '@ironarachne/rng';
import { BiomeClassifications } from '$lib/environment';
import { allSpecies } from '$lib/species';
import type { MapNode } from '$lib/map';
import { ecologyCandidatesFor } from './region_ecology';
import type { HabitatFact, FactSource, SettlementRoleFact } from './region_fact_types';
import type { EcologyInhabitantFact, EcologyRelationshipFact } from './region_ecology_types';
import type { RegionEcologyCatalog } from './region_ecology_rule_types';
import type {
  EcologyRelationshipRegion,
  EcologyOccurrence,
  EcologyFeedingRule,
  EcologyHarvestRisk,
} from './region_ecology_relationship_types';
import {
  ECOLOGY_FEEDING_RULES,
  ECOLOGY_USE_RULES,
  ECOLOGY_ACCESS_RULES,
  DANGEROUS_BANK_SPECIES,
} from './region_ecology_relationship_rules';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const factSource = (factId: string): FactSource => ({ kind: 'fact', factId });
const current = (fact: EcologyInhabitantFact | SettlementRoleFact) =>
  fact.reason?.status !== 'stale';
const sourceName = (entry: EcologyInhabitantFact) =>
  entry.source.kind === 'described' ? entry.source.label : entry.source.speciesName;
const uniqueSources = (sources: FactSource[]) => [
  ...new Map(sources.map((source) => [JSON.stringify(source), source])).values(),
];
const defaultCatalog = (): RegionEcologyCatalog => ({
  species: allSpecies,
  biomes: BiomeClassifications.getAll(),
});

/** Recheck supported cells without rolling or rewriting the saved inhabitants. */
function occurrencesFor(
  region: EcologyRelationshipRegion,
  habitat: HabitatFact,
  catalog: RegionEcologyCatalog,
): EcologyOccurrence[] {
  if (habitat.reason?.status === 'stale') return [];
  const candidates = ecologyCandidatesFor(region, habitat, catalog);
  return region
    .facts!.ecologyInhabitants.filter(
      (entry) =>
        current(entry) &&
        entry.habitatIds.includes(habitat.id) &&
        entry.source.kind !== 'creature-artifact',
    )
    .sort((a, b) => lexical(a.id, b.id))
    .flatMap((inhabitant) => {
      const candidate = candidates.find(
        (candidate) =>
          candidate.category === inhabitant.category &&
          candidate.source.kind === inhabitant.source.kind &&
          candidate.name === sourceName(inhabitant) &&
          JSON.stringify([...candidate.roles].sort()) ===
            JSON.stringify([...inhabitant.roles].sort()),
      );
      return candidate === undefined ? [] : [{ inhabitant, nodeSources: candidate.nodeSources }];
    });
}

/** Cooling directions and observed cold justify a qualification, never a projected seasonal temperature. */
function seasonalBrowse(
  region: EcologyRelationshipRegion,
  node: MapNode,
  rule: EcologyFeedingRule,
): { text: string; sources: FactSource[] } {
  if (!rule.coldBrowse || node.temperature > 5) return { text: '', sources: [] };
  const climate = region.environment.climate;
  const seasons = (climate?.seasons ?? [])
    .filter(
      (season) =>
        season.name.trim().length > 0 &&
        Number.isInteger(season.startDay) &&
        Number.isInteger(season.endDay) &&
        season.startDay >= 1 &&
        season.startDay <= 365 &&
        season.endDay >= 1 &&
        season.endDay <= 365 &&
        Number.isFinite(season.temperatureAdjustment) &&
        season.temperatureAdjustment < 0,
    )
    .sort((a, b) => a.startDay - b.startDay || a.endDay - b.endDay || lexical(a.name, b.name));
  const names = [...new Set(seasons.map((season) => season.name))].slice(0, 2);
  return names.length === 0
    ? { text: '', sources: [] }
    : {
        text: ` During ${names.join(' and ')}, cold conditions can restrict fresh browse here.`,
        sources: [
          { kind: 'environment', field: 'climate', observedValue: JSON.stringify(climate) },
        ],
      };
}

function relationship(
  id: string,
  name: string,
  description: string,
  subject: EcologyInhabitantFact,
  habitat: HabitatFact,
  relation: EcologyRelationshipFact['relation'],
  ruleId: string,
  sources: FactSource[],
): EcologyRelationshipFact {
  return {
    id: `ecology:${id}`,
    name,
    description,
    origin: 'generated',
    subjectId: subject.id,
    habitatIds: [habitat.id],
    relation,
    reason: {
      ruleId: `fantasy:region:ecology:${ruleId}:v1`,
      status: 'current',
      sources: uniqueSources([factSource(subject.id), factSource(habitat.id), ...sources]),
    },
  };
}

function feedingCandidates(
  region: EcologyRelationshipRegion,
  habitat: HabitatFact,
  occurrences: EcologyOccurrence[],
): EcologyRelationshipFact[] {
  const result: EcologyRelationshipFact[] = [];
  for (const rule of ECOLOGY_FEEDING_RULES) {
    for (const subject of occurrences.filter(
      (entry) =>
        sourceName(entry.inhabitant) === rule.subject &&
        entry.inhabitant.roles.includes(rule.subjectRole),
    )) {
      for (const target of occurrences.filter(
        (entry) =>
          entry.inhabitant.id !== subject.inhabitant.id &&
          rule.targets.includes(sourceName(entry.inhabitant)) &&
          entry.inhabitant.category === rule.targetCategory &&
          (rule.targetCategory !== 'flora' || entry.inhabitant.roles.includes('producer')),
      )) {
        // A complete biome footprint can be disconnected. Both endpoints must support this very cell.
        const nodeId = [...subject.nodeSources.keys()]
          .filter((id) => target.nodeSources.has(id))
          .sort((a, b) => a - b)[0];
        if (nodeId === undefined) continue;
        const node = region.map.nodes.find((node) => node.id === nodeId)!;
        const seasonal = seasonalBrowse(region, node, rule);
        result.push(
          relationship(
            `${rule.id}:${encodeURIComponent(subject.inhabitant.id)}:${encodeURIComponent(target.inhabitant.id)}:${encodeURIComponent(habitat.id)}`,
            `${subject.inhabitant.name} feeding`,
            `Food for ${subject.inhabitant.name}: ${target.inhabitant.name}, where both occur in ${habitat.name}.${seasonal.text}`,
            subject.inhabitant,
            habitat,
            { kind: 'feeds-on', targetId: target.inhabitant.id },
            rule.id,
            [
              factSource(target.inhabitant.id),
              ...subject.nodeSources.get(nodeId)!,
              ...target.nodeSources.get(nodeId)!,
              ...seasonal.sources,
            ],
          ),
        );
      }
    }
  }
  return result;
}

/** Only an actual settlement site in this connected dry-land habitat grants gathering access. */
function accessibleNode(
  region: EcologyRelationshipRegion,
  habitat: HabitatFact,
  occurrence: EcologyOccurrence,
  role: SettlementRoleFact,
): number | undefined {
  if (
    !current(role) ||
    role.settlement.kind !== 'embedded' ||
    !ECOLOGY_ACCESS_RULES.has(role.reason?.ruleId ?? '')
  )
    return undefined;
  const index = region.settlementIds?.indexOf(role.settlement.settlementId) ?? -1;
  const start = region.settlements[index]?.mapNodeId;
  if (start === undefined || !role.anchor.nodeIds.includes(start)) return undefined;
  const ids = new Set(habitat.anchor?.nodeIds ?? []);
  const nodes = new Map(
    region.map.nodes
      .filter((node) => ids.has(node.id) && !node.isWater && !node.isOcean)
      .map((node) => [node.id, node]),
  );
  if (!nodes.has(start)) return undefined;
  const visited = new Set([start]);
  const queue = [start];
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    if (occurrence.nodeSources.has(id)) return id;
    for (const neighbor of [...nodes.get(id)!.neighbors].sort((a, b) => a - b)) {
      if (!visited.has(neighbor) && nodes.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return undefined;
}

function useCandidates(
  region: EcologyRelationshipRegion,
  habitat: HabitatFact,
  occurrences: EcologyOccurrence[],
): EcologyRelationshipFact[] {
  const result: EcologyRelationshipFact[] = [];
  const roles = [...region.facts!.settlementRoles].sort((a, b) => lexical(a.id, b.id));
  for (const rule of ECOLOGY_USE_RULES) {
    for (const occurrence of occurrences.filter(
      (entry) =>
        entry.inhabitant.category === 'flora' &&
        entry.inhabitant.roles.includes('producer') &&
        rule.sources.includes(sourceName(entry.inhabitant)),
    )) {
      for (const role of roles) {
        const nodeId = accessibleNode(region, habitat, occurrence, role);
        if (nodeId === undefined || role.settlement.kind !== 'embedded') continue;
        result.push(
          relationship(
            `${rule.id}:${encodeURIComponent(occurrence.inhabitant.id)}:${encodeURIComponent(role.settlement.settlementId)}:${encodeURIComponent(habitat.id)}`,
            `${occurrence.inhabitant.name} gathering`,
            `Material from ${occurrence.inhabitant.name} supports ${rule.purpose} for the settlement using this connected ${habitat.name} patch.`,
            occurrence.inhabitant,
            habitat,
            { kind: 'used-by', settlement: role.settlement, use: rule.use },
            rule.id,
            [factSource(role.id), ...occurrence.nodeSources.get(nodeId)!],
          ),
        );
      }
    }
  }
  return result;
}

/** Existing payload vocabulary; at most two relationships per major habitat and six overall. */
export function generateEcologyRelationships(
  region: EcologyRelationshipRegion,
  rng: RNG,
  catalog: RegionEcologyCatalog = defaultCatalog(),
): void {
  const facts = region.facts!;
  const zones = new Set(
    facts.areas.filter((area) => area.id.startsWith('area:habitat-zone:')).map((area) => area.id),
  );
  const habitats = facts.habitats
    .filter((habitat) => habitat.areaIds.some((id) => zones.has(id)))
    .sort(
      (a, b) =>
        (b.anchor?.nodeIds.length ?? 0) - (a.anchor?.nodeIds.length ?? 0) || lexical(a.id, b.id),
    )
    .slice(0, 4);
  const selected: EcologyRelationshipFact[] = [];
  for (const habitat of habitats) {
    const occurrences = occurrencesFor(region, habitat, catalog);
    const candidates = [
      ...new Map(
        [
          ...feedingCandidates(region, habitat, occurrences),
          ...useCandidates(region, habitat, occurrences),
        ].map((entry) => [entry.id, entry]),
      ).values(),
    ].sort((a, b) => lexical(a.id, b.id));
    selected.push(...rng.shuffle(candidates).slice(0, Math.min(2, 6 - selected.length)));
    if (selected.length === 6) break;
  }
  facts.ecologyRelationships.push(...selected.sort((a, b) => lexical(a.id, b.id)));
}

/** Reuse a saved gathering relation and explicit dangerous-bank rule in the notable-place pass. */
export function ecologyHarvestRisks(region: EcologyRelationshipRegion): EcologyHarvestRisk[] {
  const uses = region
    .facts!.ecologyRelationships.filter(
      (entry) =>
        entry.relation.kind === 'used-by' &&
        entry.reason?.status === 'current' &&
        entry.reason.ruleId === 'fantasy:region:ecology:reed-material:v1',
    )
    .sort((a, b) => lexical(a.id, b.id));
  return uses.flatMap((use) =>
    use.habitatIds.flatMap((habitatId) => {
      const habitat = region.facts!.habitats.find((entry) => entry.id === habitatId);
      if (
        habitat === undefined ||
        use.relation.kind !== 'used-by' ||
        use.relation.settlement.kind !== 'embedded'
      )
        return [];
      const settlementId = use.relation.settlement.settlementId;
      const occurrences = occurrencesFor(region, habitat, defaultCatalog());
      const subject = occurrences.find((entry) => entry.inhabitant.id === use.subjectId);
      if (
        subject === undefined ||
        subject.inhabitant.category !== 'flora' ||
        !subject.inhabitant.roles.includes('producer') ||
        !ECOLOGY_USE_RULES.find((rule) => rule.id === 'reed-material')!.sources.includes(
          sourceName(subject.inhabitant),
        ) ||
        use.relation.use !== 'material'
      )
        return [];
      const observedIds = new Set(
        use.reason!.sources.flatMap((source) =>
          source.kind === 'map-node' && source.property === 'biomeId' ? [source.nodeId] : [],
        ),
      );
      return occurrences
        .filter(
          (entry) =>
            entry.inhabitant.source.kind === 'species' &&
            DANGEROUS_BANK_SPECIES.has(sourceName(entry.inhabitant)),
        )
        .flatMap((occurrence) => {
          const nodeId = [...occurrence.nodeSources.keys()]
            .filter((id) => observedIds.has(id) && subject.nodeSources.has(id))
            .sort((a, b) => a - b)[0];
          if (nodeId === undefined) return [];
          const localSubject = {
            ...subject,
            nodeSources: new Map([[nodeId, subject.nodeSources.get(nodeId)!]]),
          };
          const accessible = region.facts!.settlementRoles.some(
            (role) =>
              role.settlement.kind === 'embedded' &&
              role.settlement.settlementId === settlementId &&
              use.reason!.sources.some(
                (source) => source.kind === 'fact' && source.factId === role.id,
              ) &&
              accessibleNode(region, habitat, localSubject, role) === nodeId,
          );
          if (!accessible) return [];
          return [
            {
              use,
              inhabitant: occurrence.inhabitant,
              node: region.map.nodes.find((node) => node.id === nodeId)!,
              sources: uniqueSources([
                factSource(use.id),
                factSource(occurrence.inhabitant.id),
                ...occurrence.nodeSources.get(nodeId)!,
              ]),
            },
          ];
        });
    }),
  );
}
