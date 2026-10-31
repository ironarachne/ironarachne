import {
  settlementCharacterObservation,
  settlementWorkOptions,
} from './region_settlement_reading_evidence';
import {
  currentEmbeddedRoads,
  roadNetworkObservation,
  roadPathCurrent,
} from './region_road_evidence';
import { landscapeObservationCurrent } from './region_landscape_extent';
import { notableSubjectName, notableEvidenceKey } from './region_notable_identity';
import type { RegionNotableReferenceContext } from './region_notable_reading_types';
import type { FactBase } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionEditorialObservation, RegionGazetteerSentence } from './region_editorial_types';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { regionSemanticFactLists } from './region_fact_lists';

export const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
export const ordered = (values: string[]) => [...new Set(values)].sort(lexical);
export const editorialRoads = currentEmbeddedRoads;
export function populationObservation(snapshot: RegionSnapshot): RegionEditorialObservation {
  return {
    kind: 'settlement-populations',
    values: snapshot.settlements
      .filter(
        (entry) =>
          Number.isFinite(entry.snapshot.population) &&
          entry.snapshot.population > 0 &&
          entry.snapshot.name.trim(),
      )
      .map((entry) => ({ settlementId: entry.id, population: entry.snapshot.population }))
      .sort((a, b) => lexical(a.settlementId, b.settlementId)),
  };
}
export function roadObservation(
  snapshot: RegionSnapshot,
  settlementId: string,
  roads = editorialRoads(snapshot),
): RegionEditorialObservation {
  const incident = roads.filter((entry) => entry.ids.includes(settlementId));
  return {
    kind: 'settlement-roads',
    settlementId,
    settlementIds: ordered(
      snapshot.settlements.filter((entry) => entry.snapshot.name.trim()).map((entry) => entry.id),
    ),
    validRoadIds: roads.map((entry) => entry.route.id),
    incidentRoadIds: incident.map((entry) => entry.route.id),
    neighbourIds: ordered(
      incident.flatMap((entry) => entry.ids).filter((id) => id !== settlementId),
    ),
  };
}

/** Reading validates saved choices; it never replaces a stale sentence with a new selection. */
export function editorialSentenceChecker(
  snapshot: RegionSnapshot,
  references: RegionNotableReferenceContext = {},
) {
  const current = createRegionEvidenceChecker(snapshot);
  const facts = new Map<string, FactBase>(
    regionSemanticFactLists.flatMap((key) =>
      snapshot.facts[key].map((fact) => [fact.id, fact] as const),
    ),
  );
  const authoredCache = new Map<string, boolean>();
  const authored = (id: string, path = new Set<string>()): boolean => {
    const cached = authoredCache.get(id);
    if (cached !== undefined) return cached;
    if (path.has(id)) return true;
    const fact = facts.get(id);
    if (!fact) return false;
    if (fact.origin === 'authored') return true;
    const next = new Set(path).add(id);
    const result = (fact.reason?.sources ?? []).some(
      (source) => source.kind === 'fact' && authored(source.factId, next),
    );
    authoredCache.set(id, result);
    return result;
  };
  const observations = new Map<string, string>();
  let roads: ReturnType<typeof editorialRoads> | undefined;
  return (sentence: RegionGazetteerSentence): boolean => {
    if (sentence.reason.sources.some((source) => source.kind === 'fact' && authored(source.factId)))
      return false;
    if (
      !current({
        id: sentence.id,
        name: '',
        description: sentence.text,
        origin: 'generated',
        reason: sentence.reason,
      })
    )
      return false;
    if (sentence.candidateId.startsWith('editorial:work:')) {
      const product = snapshot.facts.products.find((entry) =>
        sentence.reason.sources.some(
          (source) => source.kind === 'fact' && source.factId === entry.id,
        ),
      );
      if (!product || !settlementWorkOptions(snapshot, product).length) return false;
    }
    return sentence.observations.every((observation) => {
      if (observation.kind === 'settlement-character') {
        const entry = snapshot.settlements.find((entry) => entry.id === observation.settlementId);
        return (
          !!entry &&
          notableEvidenceKey(settlementCharacterObservation(entry.id, entry.snapshot)) ===
            notableEvidenceKey(observation)
        );
      }
      if (observation.kind === 'road-network')
        return (
          notableEvidenceKey(roadNetworkObservation(snapshot)) === notableEvidenceKey(observation)
        );
      if (observation.kind === 'road-path') return roadPathCurrent(snapshot, observation);
      if (observation.kind === 'notable-name')
        return (
          notableSubjectName(snapshot, observation.subject, references) === observation.observedName
        );
      if (observation.kind === 'landscape-footprint')
        return landscapeObservationCurrent(snapshot, observation);
      const key =
        observation.kind === 'settlement-populations'
          ? observation.kind
          : `${observation.kind}:${observation.settlementId}`;
      if (!observations.has(key))
        observations.set(
          key,
          notableEvidenceKey(
            observation.kind === 'settlement-populations'
              ? populationObservation(snapshot)
              : roadObservation(
                  snapshot,
                  observation.settlementId,
                  (roads ??= editorialRoads(snapshot)),
                ),
          ),
        );
      return observations.get(key) === notableEvidenceKey(observation);
    });
  };
}

/** Aggregate mirror consumers must respect the per-sentence facet/name observations too. */
export function settlementPortraitCurrent(
  snapshot: RegionSnapshot,
  settlementId: string,
  readable = editorialSentenceChecker(snapshot),
): boolean {
  const gazetteer = snapshot.gazetteer;
  if (gazetteer?.version !== 5) return true;
  const reading = gazetteer.settlementReadings.find(
    (reading) =>
      reading.settlement.kind === 'embedded' && reading.settlement.settlementId === settlementId,
  );
  if (!reading) return false;
  return gazetteer.blocks
    .flatMap((block) => block.sentences)
    .filter((sentence) => reading.portraitSentenceIds.includes(sentence.id))
    .every(readable);
}
