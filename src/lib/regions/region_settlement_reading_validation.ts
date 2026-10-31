import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';

const strings = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((entry) => typeof entry === 'string' && !!entry.trim()) &&
  new Set(value).size === value.length;
/** Structural validation retains stale records for inspection without accepting foreign sentences. */
export function settlementReadingsError(value: unknown, snapshot: RegionSnapshot): string | null {
  const gazetteer = asRecord(value);
  if (
    !gazetteer ||
    !Array.isArray(gazetteer.settlementReadings) ||
    !Array.isArray(gazetteer.blocks)
  )
    return 'invalid settlement readings';
  const subjects = new Set<string>();
  const assigned = new Set<string>();
  for (const raw of gazetteer.settlementReadings) {
    const reading = asRecord(raw);
    const target = asRecord(reading?.settlement);
    if (
      !reading ||
      !target ||
      !strings(reading.portraitSentenceIds) ||
      !strings(reading.opportunitySentenceIds) ||
      reading.portraitSentenceIds.length > 2 ||
      reading.opportunitySentenceIds.length > 1
    )
      return 'invalid settlement reading';
    if (
      target.kind === 'embedded'
        ? typeof target.settlementId !== 'string' || !target.settlementId.trim()
        : target.kind !== 'artifact' ||
          typeof target.targetId !== 'string' ||
          !target.targetId.trim()
    )
      return 'invalid settlement reading target';
    const key =
      target.kind === 'embedded'
        ? `embedded:${target.settlementId}`
        : `artifact:${target.targetId}`;
    if (subjects.has(key)) return 'duplicate settlement reading';
    subjects.add(key);
    const local = gazetteer.blocks.flatMap((raw) => {
      const block = asRecord(raw);
      const destination = asRecord(block?.destination);
      const subject = asRecord(destination?.settlement);
      return destination?.section === 'settlement' &&
        subject?.kind === target.kind &&
        (target.kind === 'embedded'
          ? subject?.settlementId === target.settlementId
          : subject?.targetId === target.targetId) &&
        Array.isArray(block?.sentences)
        ? block.sentences
        : [];
    });
    for (const id of [...reading.portraitSentenceIds, ...reading.opportunitySentenceIds]) {
      if (assigned.has(id) || !local.some((sentence) => asRecord(sentence)?.id === id))
        return 'foreign or duplicate settlement sentence';
      assigned.add(id);
    }
    if (
      target.kind === 'embedded' &&
      !snapshot.settlements.some((entry) => entry.id === target.settlementId) &&
      local.some((sentence) => asRecord(asRecord(sentence)?.reason)?.status !== 'stale')
    )
      return 'missing settlement reading target';
  }
  if (snapshot.settlements.some((entry) => !subjects.has(`embedded:${entry.id}`)))
    return 'missing settlement reading';
  for (const raw of gazetteer.blocks) {
    const block = asRecord(raw);
    if (asRecord(block?.destination)?.section !== 'settlement' || !Array.isArray(block?.sentences))
      continue;
    if (block.sentences.some((sentence) => !assigned.has(String(asRecord(sentence)?.id))))
      return 'unassigned settlement sentence';
  }
  return null;
}

export function settlementCharacterObservationError(value: Record<string, unknown>): string | null {
  const tags = value.settlementTags;
  if (
    typeof value.settlementId !== 'string' ||
    !value.settlementId.trim() ||
    typeof value.categoryName !== 'string' ||
    !value.categoryName.trim() ||
    !['prosperity', 'lawAndOrder', 'commerce', 'foodSecurity', 'publicHealth'].every(
      (key) => typeof value[key] === 'number' && Number.isFinite(value[key]),
    ) ||
    !['agrarian', 'market', 'industrial', 'extractive', 'mixed'].includes(
      String(value.economicRole),
    ) ||
    !strings(tags) ||
    tags.some((tag, index) => index > 0 && tags[index - 1] >= tag)
  )
    return 'invalid settlement character observation';
  return null;
}
