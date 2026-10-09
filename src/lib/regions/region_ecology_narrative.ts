import type { RNG } from '@ironarachne/rng';
import { composeNarrative, type NarrativeCandidate } from '$lib/narrative';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import { toRegionSnapshot } from './region_snapshot';
import type { FactBase } from './region_fact_types';
import type { EcologyRelationshipFact } from './region_ecology_types';
import { regionSemanticFactLists } from './region_resource_editing';

export const ECOLOGY_SUMMARY_ID = 'claim:ecology-summary';
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const sentences = (text: string) => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** A stale upstream explanation cannot justify a new narrative claim. */
function evidenceIsCurrent(snapshot: RegionSnapshot, ids: string[]): boolean {
  const facts = new Map<string, FactBase>(
    regionSemanticFactLists.flatMap((list) =>
      snapshot.facts[list].map((fact) => [fact.id, fact] as const),
    ),
  );
  const visited = new Set<string>();
  const pending = [...ids];
  while (pending.length) {
    const id = pending.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const fact = facts.get(id);
    if (!fact || fact.reason?.status === 'stale') return false;
    pending.push(
      ...(fact.reason?.sources.flatMap((source) =>
        source.kind === 'fact' ? [source.factId] : [],
      ) ?? []),
    );
  }
  return true;
}

function relationCandidate(
  snapshot: RegionSnapshot,
  relation: EcologyRelationshipFact,
): NarrativeCandidate | null {
  const population = snapshot.facts.ecologyInhabitants.find(
    (fact) => fact.id === relation.subjectId,
  );
  const habitats = snapshot.facts.habitats.filter((fact) => relation.habitatIds.includes(fact.id));
  if (
    !population?.name.trim() ||
    habitats.length !== relation.habitatIds.length ||
    !habitats.length ||
    habitats.some((habitat) => !habitat.name.trim() || !population.habitatIds.includes(habitat.id))
  )
    return null;
  const where = habitats
    .map((habitat) => habitat.name.trim())
    .sort(lexical)
    .join(' and ');
  const sources = [relation.id, population.id, ...relation.habitatIds];
  const name = population.name.trim();
  let options: string[];
  let importance: NarrativeCandidate['importance'] = 'distinctive';
  let fantastical = population.category === 'fantastical';
  if (relation.relation.kind === 'used-by') {
    const target = relation.relation.settlement;
    if (target.kind !== 'embedded') return null;
    const settlement = snapshot.settlements
      .find((entry) => entry.id === target.settlementId)
      ?.snapshot.name.trim();
    if (!settlement) return null;
    const use = { food: 'food', material: 'materials', domestication: 'animals for domestication' }[
      relation.relation.use
    ];
    options = [
      `In ${where}, the local population of ${name} provides ${use} for ${settlement}.`,
      `${settlement} draws on ${name} in ${where} as a source of ${use}.`,
      `The ${name} population in ${where} is locally important as a source of ${use} for ${settlement}.`,
    ];
    importance = 'defining';
  } else {
    const target = snapshot.facts.ecologyInhabitants.find(
      (fact) => fact.id === ('targetId' in relation.relation ? relation.relation.targetId : ''),
    );
    if (!target?.name.trim() || habitats.some((habitat) => !target.habitatIds.includes(habitat.id)))
      return null;
    sources.push(target.id);
    fantastical ||= target.category === 'fantastical';
    const other = target.name.trim();
    const clauses = {
      'feeds-on': [
        `the local population of ${name} feeds on ${other}`,
        `the ${other} population supplies food for ${name}`,
      ],
      pollinates: [
        `the local population of ${name} pollinates ${other}`,
        `the ${other} population is pollinated by ${name}`,
      ],
      'competes-with': [
        `the local population of ${name} competes with ${other}`,
        `the populations of ${name} and ${other} are competitors`,
      ],
      'pest-of': [
        `the local population of ${name} is a pest of ${other}`,
        `the ${other} population is affected by the pest ${name}`,
      ],
    }[relation.relation.kind];
    options = [`In ${where}, ${clauses[0]}.`, `${clauses[1]} in ${where}.`];
  }
  if (!evidenceIsCurrent(snapshot, sources)) return null;
  return candidate(
    relation.id,
    fantastical ? 'fantastical' : population.id,
    importance,
    sources,
    options,
  );
}

function candidate(
  id: string,
  topic: string,
  importance: NarrativeCandidate['importance'],
  sourceIds: string[],
  options: string[],
): NarrativeCandidate {
  return {
    id,
    topic,
    importance,
    sourceIds,
    templates: [
      {
        id: `${id}:sentence`,
        parts: [
          { id: 'sentence', options: options.map((text) => text[0].toUpperCase() + text.slice(1)) },
        ],
      },
    ],
  };
}

/** Only explicit gathering hazards establish danger to local inhabitants. */
function hazardCandidates(snapshot: RegionSnapshot): NarrativeCandidate[] {
  return snapshot.facts.notables
    .filter(
      (fact) =>
        fact.kind === 'hazard' &&
        fact.reason?.ruleId === 'fantasy:region:ecology-bank-gathering:v1',
    )
    .flatMap((hazard) => {
      const sourceIds = hazard.reason!.sources.flatMap((source) =>
        source.kind === 'fact' ? [source.factId] : [],
      );
      const population = snapshot.facts.ecologyInhabitants.find((fact) =>
        sourceIds.includes(fact.id),
      );
      const use = snapshot.facts.ecologyRelationships.find(
        (fact) => sourceIds.includes(fact.id) && fact.relation.kind === 'used-by',
      );
      const habitat = snapshot.facts.habitats.find(
        (fact) => use?.habitatIds.includes(fact.id) && population?.habitatIds.includes(fact.id),
      );
      if (!population?.name.trim() || !habitat?.name.trim()) return [];
      const sources = [hazard.id, population.id, habitat.id, ...sourceIds];
      if (!evidenceIsCurrent(snapshot, sources)) return [];
      return [
        candidate(
          hazard.id,
          population.category === 'fantastical' ? 'fantastical' : population.id,
          'defining',
          sources,
          [
            `In ${habitat.name}, the presence of ${population.name} makes the gathering banks hazardous.`,
            `Gatherers in ${habitat.name} must take care around ${population.name}.`,
            `The presence of ${population.name} in ${habitat.name} poses a hazard to local gatherers.`,
          ],
        ),
      ];
    });
}

function ecologyCandidates(snapshot: RegionSnapshot): NarrativeCandidate[] {
  const relationships = new Set<string>();
  const candidates = [
    ...hazardCandidates(snapshot),
    ...snapshot.facts.ecologyRelationships.flatMap((relation) => {
      const entry = relationCandidate(snapshot, relation);
      if (!entry) return [];
      const key =
        relation.relation.kind === 'competes-with'
          ? JSON.stringify([
              relation.relation.kind,
              [relation.subjectId, relation.relation.targetId].sort(lexical),
              [...relation.habitatIds].sort(lexical),
            ])
          : relation.id;
      if (relationships.has(key)) return [];
      relationships.add(key);
      return [entry];
    }),
  ];
  // Keep one meaning per population, preferring its significance to residents over ordinary feeding.
  const seen = new Set<string>();
  return candidates
    .sort(
      (a, b) =>
        Number(b.importance === 'defining') - Number(a.importance === 'defining') ||
        lexical(a.id, b.id),
    )
    .filter((entry) => {
      if (seen.has(entry.topic) && entry.topic !== 'fantastical') return false;
      seen.add(entry.topic);
      return true;
    });
}

/** Called once during generation; readers and exports reuse the persisted claim. */
export function generateEcologyNarrative(region: Region, rng: RNG): void {
  const facts = region.facts!;
  if (facts.claims.some((fact) => fact.id === ECOLOGY_SUMMARY_ID)) return;
  const snapshot = toRegionSnapshot(region);
  if (!evidenceIsCurrent(snapshot, ['area:land'])) return;
  const includeFantasy = rng.int(1, 10) === 1;
  const candidates = ecologyCandidates(snapshot).filter(
    (entry) => includeFantasy || entry.topic !== 'fantastical',
  );
  const result = composeNarrative(
    { id: ECOLOGY_SUMMARY_ID, kind: 'region-ecology', candidates },
    { maxSentences: 4, maxPerTopic: 1, repetitionWindow: 0 },
    { recentSelections: [] },
    rng,
  );
  if (!result.text) return;
  const selected = new Set(result.selections.map((selection) => selection.candidateId));
  const relatedIds = [
    ...new Set(
      candidates.filter((entry) => selected.has(entry.id)).flatMap((entry) => entry.sourceIds),
    ),
  ].sort(lexical);
  facts.claims.push({
    id: ECOLOGY_SUMMARY_ID,
    name: 'Regional ecology',
    description: result.text,
    origin: 'generated',
    subjectId: 'area:land',
    relatedIds,
    reason: {
      ruleId: 'fantasy:region:ecology-narrative:v1',
      status: 'current',
      sources: ['area:land', ...relatedIds].map((factId) => ({ kind: 'fact', factId })),
    },
  });
}

/** Legacy reading fallback retains saved wording and never composes or rolls. */
export function legacyEcologyParagraph(snapshot: RegionSnapshot): string {
  let remaining = 4;
  return ecologyCandidates(snapshot)
    .filter((entry) => entry.topic !== 'fantastical')
    .slice(0, 4)
    .map((entry) => {
      const population = snapshot.facts.ecologyInhabitants.find((fact) => fact.id === entry.topic)!;
      const relation = snapshot.facts.ecologyRelationships.find((fact) => fact.id === entry.id);
      const hazard = snapshot.facts.notables.find((fact) => fact.id === entry.id);
      const detail = (relation ?? hazard)?.description.split(' Hook:')[0].trim();
      const habitatNames = snapshot.facts.habitats
        .filter((fact) => entry.sourceIds.includes(fact.id))
        .map((fact) => fact.name.trim())
        .filter(Boolean)
        .sort(lexical);
      if (!detail) return '';
      const prefix =
        detail.toLowerCase().includes(population.name.toLowerCase()) &&
        habitatNames.every((name) => detail.includes(name))
          ? ''
          : `The local population of ${population.name} occurs in ${habitatNames.join(' and ')}. `;
      const text = prefix + sentences(detail);
      const count = text.match(/[.!?](?:\s|$)/g)?.length ?? 1;
      if (count > remaining) return '';
      remaining -= count;
      return text;
    })
    .filter(Boolean)
    .join(' ');
}
