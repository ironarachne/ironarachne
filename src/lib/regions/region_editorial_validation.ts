import { landscapeObservationError, landscapePlacesError } from './region_landscape_validation';
import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';
import { regionOverviewReasonError } from './region_assessment_validation';
import { regionSemanticFactLists } from './region_fact_lists';

const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);
const unique = (value: unknown): value is string[] =>
  strings(value) && new Set(value).size === value.length;
const ordered = (value: unknown): value is string[] =>
  unique(value) && value.every((entry, index) => index === 0 || value[index - 1] < entry);
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export function regionGazetteerError(value: unknown, snapshot: RegionSnapshot): string | null {
  if (value === undefined) return null;
  const gazetteer = asRecord(value);
  if (
    !gazetteer ||
    (gazetteer.version !== 1 && gazetteer.version !== 2) ||
    !Array.isArray(gazetteer.blocks)
  )
    return 'invalid region gazetteer';
  const factIds = new Set(
    regionSemanticFactLists.flatMap((key) => snapshot.facts[key].map((fact) => fact.id)),
  );
  if (gazetteer.version === 2) {
    const error = landscapePlacesError(gazetteer.landscapePlaces, snapshot, factIds);
    if (error) return error;
  }
  const blocks = new Set<string>();
  const sentences = new Set<string>();
  for (const raw of gazetteer.blocks) {
    const block = asRecord(raw);
    const destination = asRecord(block?.destination);
    if (
      !block ||
      !text(block.id) ||
      blocks.has(String(block.id)) ||
      !destination ||
      ![
        'opening',
        'landscape',
        ...(gazetteer.version === 2 ? ['notable-place'] : []),
        'ecology',
        'materials-work',
        'travel',
        'hazards',
        'settlement',
      ].includes(String(destination.section)) ||
      !Array.isArray(block.sentences) ||
      !block.sentences.length
    )
      return 'invalid gazetteer block';
    blocks.add(String(block.id));
    if (destination.section === 'settlement') {
      const target = asRecord(destination.settlement);
      if (
        !target ||
        target.kind !== 'embedded' ||
        !text(target.settlementId) ||
        (!snapshot.settlements.some((entry) => entry.id === target.settlementId) &&
          !block.sentences.every(
            (sentence) => asRecord(asRecord(sentence)?.reason)?.status === 'stale',
          ))
      )
        return 'invalid gazetteer settlement';
    } else if (destination.settlement !== undefined) return 'unexpected gazetteer settlement';
    if (destination.landscapePlaceId !== undefined) {
      const places = gazetteer.landscapePlaces as { id: string; owner: string }[] | undefined;
      if (
        gazetteer.version !== 2 ||
        !['landscape', 'notable-place'].includes(String(destination.section)) ||
        !places?.some(
          (place) =>
            place.id === destination.landscapePlaceId && place.owner === destination.section,
        )
      )
        return 'invalid landscape place destination';
    } else if (destination.section === 'notable-place')
      return 'missing landscape place destination';
    for (const rawSentence of block.sentences) {
      const sentence = asRecord(rawSentence);
      const selection = asRecord(sentence?.selection);
      if (
        !sentence ||
        !text(sentence.id) ||
        sentences.has(String(sentence.id)) ||
        !text(sentence.text) ||
        !text(sentence.candidateId) ||
        !unique(sentence.assertionKeys) ||
        !sentence.assertionKeys.length ||
        typeof sentence.repeatedOrientation !== 'boolean' ||
        !selection ||
        !text(selection.subjectId) ||
        selection.candidateId !== sentence.candidateId ||
        !text(selection.templateId) ||
        !Array.isArray(selection.optionIndexes) ||
        !selection.optionIndexes.length ||
        !selection.optionIndexes.every((index) => Number.isInteger(index) && Number(index) >= 0) ||
        !Array.isArray(sentence.observations) ||
        sentence.reason === undefined
      )
        return 'invalid gazetteer sentence';
      sentences.add(String(sentence.id));
      const error = regionOverviewReasonError(sentence.reason, snapshot.map, factIds);
      if (error) return error;
      for (const rawObservation of sentence.observations) {
        const observation = asRecord(rawObservation);
        if (!observation) return 'invalid gazetteer observation';
        if (observation.kind === 'landscape-footprint' && gazetteer.version === 2) {
          const error = landscapeObservationError(observation);
          if (error) return error;
        } else if (observation.kind === 'settlement-populations') {
          if (!Array.isArray(observation.values) || observation.values.length < 2)
            return 'invalid gazetteer population comparison';
          const ids: string[] = [];
          for (const rawValue of observation.values) {
            const entry = asRecord(rawValue);
            if (
              !entry ||
              !text(entry.settlementId) ||
              typeof entry.population !== 'number' ||
              !Number.isFinite(entry.population) ||
              entry.population <= 0
            )
              return 'invalid gazetteer population';
            ids.push(String(entry.settlementId));
          }
          if (!ordered(ids)) return 'unordered gazetteer populations';
        } else if (observation.kind === 'settlement-roads') {
          if (
            !text(observation.settlementId) ||
            !ordered(observation.settlementIds) ||
            !ordered(observation.validRoadIds) ||
            !ordered(observation.incidentRoadIds) ||
            !ordered(observation.neighbourIds) ||
            !observation.settlementIds.includes(String(observation.settlementId)) ||
            observation.neighbourIds.some(
              (id) =>
                !(observation.settlementIds as string[]).includes(id) ||
                id === observation.settlementId,
            ) ||
            observation.incidentRoadIds.some(
              (id) => !(observation.validRoadIds as string[]).includes(id),
            )
          )
            return 'invalid gazetteer road comparison';
        } else return 'unknown gazetteer observation';
      }
    }
  }
  return null;
}
