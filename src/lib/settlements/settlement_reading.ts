import { composeNarrative, type NarrativeContext } from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type { Settlement } from './settlement_types';
import type {
  SettlementPortraitSubject,
  SettlementPortraitResult,
} from './settlement_reading_types';
import { SETTLEMENT_FEATURE_RULES } from './settlement_features';

/** Domain-owned meanings; category blurbs cannot grant institutions, wildlife or industries. */
export function settlementPortraitSubject(
  settlement: Settlement,
  id = settlement.name || 'settlement',
  eligibleRuleIds = SETTLEMENT_FEATURE_RULES.filter((rule) => !rule.requirements.length).map(
    (rule) => rule.id,
  ),
): SettlementPortraitSubject {
  const candidates = SETTLEMENT_FEATURE_RULES.filter(
    (rule) =>
      eligibleRuleIds.includes(rule.id) && rule.categoryNames.includes(settlement.category.name),
  ).map((rule) => ({
    id: rule.id,
    topic: rule.requirements.some((requirement) => requirement.kind === 'activity')
      ? 'practice'
      : 'character',
    importance: 'distinctive' as const,
    sourceIds: [],
    templates: [{ id: `portrait:${rule.id}`, parts: [{ id: 'sentence', options: rule.wording }] }],
  }));
  // A mixed profile must not be flattened into general prosperity or general misery.
  const social =
    settlement.lawAndOrder >= 7
      ? [
          'People have a reputation for orderly dealings.',
          'Orderly dealings are part of the local reputation.',
        ]
      : settlement.lawAndOrder <= 3
        ? [
            'Dealings here have a reputation for disorder.',
            'Local dealings are known for their uncertain order.',
          ]
        : [];
  if (social.length)
    candidates.push({
      id: `social:${settlement.lawAndOrder >= 7 ? 'orderly' : 'disorderly'}`,
      topic: 'social',
      importance: 'distinctive',
      sourceIds: [],
      templates: [
        {
          id: `portrait:social:${settlement.lawAndOrder >= 7 ? 'orderly' : 'disorderly'}`,
          parts: [{ id: 'sentence', options: social }],
        },
      ],
    });
  return { id, candidates };
}

export function composeSettlementPortrait(
  subject: SettlementPortraitSubject,
  rng: RNG,
  context: NarrativeContext = { recentSelections: [] },
): SettlementPortraitResult {
  return composeNarrative(
    { ...subject, kind: 'settlement' },
    { maxSentences: 3, maxPerTopic: 1, repetitionWindow: 8 },
    context,
    rng,
  );
}
