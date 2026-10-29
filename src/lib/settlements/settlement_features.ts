import { composeNarrative, type NarrativeCandidate } from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type { SettlementFeatureRule } from './settlement_feature_types';
import type { Settlement } from './settlement_types';

const categories = ['hamlet', 'village', 'town', 'borough', 'city', 'metropolis'];
/** Regional rules are meanings with explicit requirements, never filters over saved prose. */
export const SETTLEMENT_FEATURE_RULES: readonly SettlementFeatureRule[] = [
  {
    id: 'communal-courtyard:v1',
    categoryNames: categories,
    requirements: [],
    wording: [
      'Neighbors gather in a shared courtyard to exchange news.',
      'A communal courtyard is the meeting place for local celebrations.',
    ],
  },
  {
    id: 'winding-lanes:v1',
    categoryNames: categories,
    requirements: [],
    wording: [
      'Narrow lanes wind between tightly clustered homes.',
      'Doorways open onto a maze of small lanes and shared passages.',
    ],
  },
  {
    id: 'evening-stories:v1',
    categoryNames: categories,
    requirements: [],
    wording: [
      'People linger at their doorways in the evening to swap stories.',
      'Evening storytelling draws neighbors out of their homes.',
    ],
  },
  {
    id: 'small-gathering-place:v1',
    categoryNames: ['hamlet', 'village'],
    requirements: [],
    wording: [
      'A small common at the center of the settlement hosts its gatherings.',
      'The central meeting place is never far from anyone’s doorway.',
    ],
  },
  {
    id: 'district-gatherings:v1',
    categoryNames: ['town', 'borough', 'city', 'metropolis'],
    requirements: [],
    wording: [
      'Each neighborhood has its own meeting place and local traditions.',
      'Neighborhood celebrations give the crowded streets their own rhythms.',
    ],
  },
  {
    id: 'riverbank:v1',
    categoryNames: categories,
    requirements: [{ kind: 'geography', predicateKey: 'riverbank' }],
    wording: ['A river runs beside the settlement.'],
  },
  {
    id: 'raccoons:v1',
    categoryNames: categories,
    requirements: [{ kind: 'organism', source: { kind: 'species', speciesName: 'raccoon' } }],
    wording: ['Raccoons forage around the edges of the settlement.'],
  },
  ...[
    ['craft-linen', 'Looms sound from homes where people weave linen.'],
    ['craft-woven-mats', 'Households weave plant stems into mats.'],
    [
      'craft-construction-components',
      'Households practice woodwork, shaping components for building.',
    ],
    ['craft-dressed-stone', 'Stone dressing is practiced by local households.'],
    ['cultivation', 'Households tend cultivated plots.'],
  ].map(([activityKey, text]) => ({
    id: `${activityKey}:v1`,
    categoryNames: categories,
    requirements: [{ kind: 'activity' as const, activityKey }],
    wording: [text],
  })),
];

/** The caller supplies eligibility, so this composer has no knowledge of regional facts. */
export function describeSettlementFeatures(
  settlement: Settlement,
  eligibleRuleIds: string[],
  rng: RNG,
): { text: string; ruleIds: string[] } {
  const candidates: NarrativeCandidate[] = SETTLEMENT_FEATURE_RULES.filter(
    (rule) =>
      eligibleRuleIds.includes(rule.id) && rule.categoryNames.includes(settlement.category.name),
  ).map((rule) => ({
    id: rule.id,
    topic: rule.requirements.some((entry) => entry.kind === 'activity') ? rule.id : 'character',
    importance: rule.requirements.some((entry) => entry.kind === 'activity')
      ? 'defining'
      : 'distinctive',
    sourceIds: [],
    templates: [{ id: `${rule.id}:words`, parts: [{ id: 'sentence', options: rule.wording }] }],
  }));
  const narrative = composeNarrative(
    { id: settlement.name || 'settlement', kind: 'settlement', candidates },
    { maxSentences: 3, maxPerTopic: 1, repetitionWindow: 4 },
    { recentSelections: [] },
    rng,
  );
  return {
    text: narrative.text,
    ruleIds: narrative.selections.map((selection) => selection.candidateId),
  };
}
