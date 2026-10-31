import {
  settlementReadingsError,
  settlementCharacterObservationError,
} from './region_settlement_reading_validation';
import { roadReadingsError, roadObservationError } from './region_road_validation';
import { notableReadingsError, notableSubjectError } from './region_notable_validation';
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
    (gazetteer.version !== 1 &&
      gazetteer.version !== 2 &&
      gazetteer.version !== 3 &&
      gazetteer.version !== 4 &&
      gazetteer.version !== 5) ||
    !Array.isArray(gazetteer.blocks)
  )
    return 'invalid region gazetteer';
  const factIds = new Set(
    regionSemanticFactLists.flatMap((key) => snapshot.facts[key].map((fact) => fact.id)),
  );
  if (gazetteer.version !== 1) {
    const error = landscapePlacesError(gazetteer.landscapePlaces, snapshot, factIds);
    if (error) return error;
  }
  if (gazetteer.version === 3 || gazetteer.version === 4 || gazetteer.version === 5) {
    const error = notableReadingsError(gazetteer.notableReadings, snapshot, factIds, (sentence) =>
      regionGazetteerError(
        {
          version: 3,
          landscapePlaces: [],
          notableReadings: [],
          blocks: [
            { id: 'prompt-validation', destination: { section: 'hazards' }, sentences: [sentence] },
          ],
        },
        snapshot,
      ),
    );
    if (error) return error;
  }
  if (gazetteer.version === 4 || gazetteer.version === 5) {
    const error = roadReadingsError(
      gazetteer.roadReadings,
      { ...snapshot, gazetteer: value as RegionSnapshot['gazetteer'] },
      factIds,
    );
    if (error) return error;
  }
  if (gazetteer.version === 5) {
    const error = settlementReadingsError(value, snapshot);
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
        ...(gazetteer.version !== 1 ? ['notable-place'] : []),
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
        gazetteer.version === 1 ||
        !['landscape', 'notable-place'].includes(String(destination.section)) ||
        !places?.some(
          (place) =>
            place.id === destination.landscapePlaceId && place.owner === destination.section,
        )
      )
        return 'invalid landscape place destination';
    } else if (destination.section === 'notable-place' && destination.notableId === undefined)
      return 'missing landscape place destination';
    if (destination.notableId !== undefined) {
      if (
        (gazetteer.version !== 3 && gazetteer.version !== 4 && gazetteer.version !== 5) ||
        destination.landscapePlaceId !== undefined ||
        !['hazards', 'notable-place'].includes(String(destination.section)) ||
        !(gazetteer.notableReadings as { notableId: string }[]).some(
          (entry) => entry.notableId === destination.notableId,
        )
      )
        return 'invalid notable destination';
    }
    if (
      destination.routeId !== undefined &&
      ((gazetteer.version !== 4 && gazetteer.version !== 5) ||
        destination.section !== 'travel' ||
        destination.settlement !== undefined ||
        destination.notableId !== undefined ||
        destination.landscapePlaceId !== undefined ||
        !(gazetteer.roadReadings as { routeId: string }[]).some(
          (entry) => entry.routeId === destination.routeId,
        ))
    )
      return 'invalid road destination';
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
      if (
        destination.routeId !== undefined &&
        (!(
          sentence.reason &&
          (asRecord(sentence.reason)?.sources as { kind: string; factId?: string }[]).some(
            (source) => source.kind === 'fact' && source.factId === destination.routeId,
          )
        ) ||
          !sentence.observations.some((raw) => {
            const observation = asRecord(raw);
            return observation?.kind === 'road-path' && observation.routeId === destination.routeId;
          }))
      )
        return 'unsupported road sentence destination';
      for (const rawObservation of sentence.observations) {
        const observation = asRecord(rawObservation);
        if (!observation) return 'invalid gazetteer observation';
        if (observation.kind === 'settlement-character' && gazetteer.version === 5) {
          const error = settlementCharacterObservationError(observation);
          if (error) return error;
        } else if (
          (gazetteer.version === 4 || gazetteer.version === 5) &&
          ['road-network', 'road-path'].includes(String(observation.kind))
        ) {
          const error = roadObservationError(observation);
          if (error) return error;
        } else if (observation.kind === 'landscape-footprint' && gazetteer.version !== 1) {
          const error = landscapeObservationError(observation);
          if (error) return error;
        } else if (
          observation.kind === 'notable-name' &&
          (gazetteer.version === 3 || gazetteer.version === 4 || gazetteer.version === 5)
        ) {
          if (!text(observation.observedName) || notableSubjectError(observation.subject))
            return 'invalid notable name observation';
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
