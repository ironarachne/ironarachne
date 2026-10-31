import { asRecord } from '$lib/artifact_kinds';
import { regionOverviewReasonError } from './region_assessment_validation';
import {
  notableReading,
  notableReadingCurrent,
  notableEvidenceKey,
} from './region_notable_identity';
import type { RegionNotableReading } from './region_notable_reading_types';
import type { RegionSnapshot } from './region_snapshot';
import { notableEditorialCandidates } from './region_notable_candidates';

const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export function notableSubjectError(value: unknown): string | null {
  const subject = asRecord(value);
  if (subject?.kind === 'fact' && text(subject.factId)) return null;
  const target = asRecord(subject?.target);
  if (
    subject?.kind === 'settlement' &&
    target &&
    ((target.kind === 'embedded' && text(target.settlementId)) ||
      (target.kind === 'artifact' && text(target.targetId)))
  )
    return null;
  return 'invalid notable subject';
}

export function notableReadingsError(
  value: unknown,
  snapshot: RegionSnapshot,
  factIds: Set<string>,
  checkSentence: (sentence: unknown) => string | null,
): string | null {
  if (!Array.isArray(value)) return 'invalid notable readings';
  const ids = new Set<string>();
  const families = new Set<string>();
  for (const raw of value) {
    const reading = asRecord(raw);
    if (
      !reading ||
      !text(reading.notableId) ||
      ids.has(String(reading.notableId)) ||
      !['settlement-approach', 'place', 'road-river-meeting', 'hazard'].includes(
        String(reading.headingKind),
      ) ||
      !Array.isArray(reading.observations) ||
      reading.observations.length
    )
      return 'invalid notable reading';
    ids.add(String(reading.notableId));
    const error = regionOverviewReasonError(reading.reason, snapshot.map, factIds);
    if (error) return error;
    const reason = asRecord(reading.reason)!;
    if (reading.subject !== undefined) {
      const error = notableSubjectError(reading.subject);
      if (error) return error;
    }
    if (reason.ruleId !== 'fantasy:region:notable-reading:v1')
      return 'unsupported notable reading rule';
    const sources = reason.sources as { kind: string; factId?: string }[];
    if (
      sources.length !== 1 ||
      sources[0].kind !== 'fact' ||
      sources[0].factId !== reading.notableId
    )
      return 'unsupported notable reading reason';
    const fact = snapshot.facts.notables.find((entry) => entry.id === reading.notableId);
    if (reason.status !== 'stale') {
      if (!fact) return 'missing notable reading target';
      const expected = notableReading(snapshot, fact);
      if (
        expected.headingKind !== reading.headingKind ||
        notableEvidenceKey(expected.subject) !== notableEvidenceKey(reading.subject)
      )
        return 'unsupported notable subject binding';
    }
    if (reading.prompt !== undefined) {
      const prompt = asRecord(reading.prompt);
      if (!prompt || !text(prompt.familyId) || families.has(String(prompt.familyId)))
        return 'invalid notable prompt';
      families.add(String(prompt.familyId));
      if (families.size > 2) return 'too many notable prompts';
      const error = checkSentence(prompt.sentence);
      if (error) return error;
      const sentence = asRecord(prompt.sentence)!;
      const promptReason = asRecord(sentence.reason)!;
      if (
        sentence.id !== `notable-prompt:${reading.notableId}` ||
        promptReason.ruleId !== `fantasy:region:adventure-prompt:${prompt.familyId}:v1` ||
        !(promptReason.sources as { kind: string; factId?: string }[]).some(
          (source) => source.kind === 'fact' && source.factId === reading.notableId,
        )
      )
        return 'unsupported notable prompt';
      if (
        promptReason.status !== 'stale' &&
        !notableReadingCurrent(snapshot, raw as RegionNotableReading)
      )
        return 'invalid prompt owner';
      if (promptReason.status !== 'stale') {
        const candidate = notableEditorialCandidates(snapshot).prompts.find(
          (entry) => entry.notableId === reading.notableId && entry.familyId === prompt.familyId,
        );
        const selection = asRecord(sentence.selection)!;
        if (
          !candidate ||
          !candidate.editorial.narrative.templates.some(
            (template) =>
              template.id === selection.templateId &&
              template.parts[0].options.includes(String(sentence.text)),
          ) ||
          notableEvidenceKey(candidate.editorial.sources) !==
            notableEvidenceKey(promptReason.sources) ||
          notableEvidenceKey(candidate.editorial.observations) !==
            notableEvidenceKey(sentence.observations)
        )
          return 'unsupported notable prompt content';
      }
    }
  }
  return null;
}
