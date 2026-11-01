import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';

const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const facet = (value: unknown): boolean => {
  const record = asRecord(value);
  return !!record && typeof record.id === 'string' && typeof record.label === 'string';
};

export function organizationObservationError(value: Record<string, unknown>): string | null {
  const profile = asRecord(value.observedProfile);
  const environment = asRecord(profile?.environmentNarrative);
  return !text(value.organizationId) ||
    typeof value.observedName !== 'string' ||
    !text(value.observedKindId) ||
    !profile ||
    typeof profile.hook !== 'string' ||
    !Array.isArray(profile.personalityTraits) ||
    !profile.personalityTraits.every(facet) ||
    !facet(profile.goal) ||
    !facet(profile.weakness) ||
    !facet(profile.publicStanding) ||
    (profile.environmentNarrative !== undefined &&
      (!environment ||
        typeof environment.id !== 'string' ||
        typeof environment.shortLabel !== 'string'))
    ? 'invalid organization profile observation'
    : null;
}

/** Every generated sentence belongs to exactly one existing organization and has profile evidence. */
export function organizationReadingsError(value: unknown, snapshot: RegionSnapshot): string | null {
  const gazetteer = asRecord(value);
  if (
    !gazetteer ||
    !Array.isArray(gazetteer.organizationReadings) ||
    !Array.isArray(gazetteer.blocks)
  )
    return 'invalid organization readings';
  const subjects = new Set<string>();
  const assigned = new Set<string>();
  for (const raw of gazetteer.organizationReadings) {
    const reading = asRecord(raw);
    if (
      !reading ||
      !text(reading.organizationId) ||
      !['generated', 'authored'].includes(String(reading.origin)) ||
      !strings(reading.sentenceIds) ||
      reading.sentenceIds.length > 2 ||
      (reading.origin === 'authored' && reading.sentenceIds.length > 0)
    )
      return 'invalid organization reading';
    if (
      subjects.has(reading.organizationId) ||
      !snapshot.organizations.some((entry) => entry.id === reading.organizationId)
    )
      return 'missing or duplicate organization reading target';
    subjects.add(reading.organizationId);
    const local = gazetteer.blocks.flatMap((raw) => {
      const block = asRecord(raw);
      const destination = asRecord(block?.destination);
      return destination?.section === 'organization' &&
        destination.organizationId === reading.organizationId &&
        Array.isArray(block?.sentences)
        ? block.sentences
        : [];
    });
    for (const id of reading.sentenceIds) {
      if (assigned.has(id) || !local.some((sentence) => asRecord(sentence)?.id === id))
        return 'foreign or duplicate organization sentence';
      assigned.add(id);
    }
  }
  if (snapshot.organizations.some((entry) => !subjects.has(entry.id)))
    return 'missing organization reading';
  for (const raw of gazetteer.blocks) {
    const block = asRecord(raw);
    const destination = asRecord(block?.destination);
    if (destination?.section !== 'organization') {
      if (destination?.organizationId !== undefined) return 'unexpected organization destination';
      continue;
    }
    if (
      !subjects.has(String(destination.organizationId)) ||
      !Array.isArray(block?.sentences) ||
      block.sentences.length > 2
    )
      return 'invalid organization destination';
    for (const rawSentence of block.sentences) {
      const sentence = asRecord(rawSentence);
      if (!assigned.has(String(sentence?.id))) return 'unassigned organization sentence';
      if (
        !Array.isArray(sentence?.observations) ||
        !sentence.observations.some((raw) => {
          const observation = asRecord(raw);
          return (
            observation?.kind === 'organization-profile' &&
            observation.organizationId === destination.organizationId &&
            !organizationObservationError(observation)
          );
        })
      )
        return 'unsupported organization sentence';
    }
  }
  return null;
}
