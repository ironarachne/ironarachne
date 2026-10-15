import { composeNarrative } from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type { ResourceFact, FactSource } from './region_fact_types';
import type { RegionFactAssessment, RegionAssessmentTopic } from './region_assessment_types';

export function resourceAssessments(fact: ResourceFact): RegionFactAssessment[] {
  const positive = ['available', 'limited'].includes(fact.availability);
  const sources = fact.reason?.sources ?? [];
  const confirmed = fact.depositIds.length > 0 || fact.kind === 'freshwater';
  const unknown = (topic: RegionAssessmentTopic, explanation: string): RegionFactAssessment => ({
    topic,
    status: 'unknown',
    explanation,
    sources: [],
  });
  return [
    {
      topic: 'resource-presence',
      status: positive ? (confirmed ? 'confirmed' : 'inferred') : 'unknown',
      explanation: fact.description,
      sources,
    },
    unknown(
      'resource-exploitation',
      'Availability does not establish current extraction, industry or trade.',
    ),
    unknown('sustainable-yield', 'No sustainable yield is established.'),
    ...(fact.kind === 'freshwater'
      ? [unknown('water-purity', 'Drinking-water purity is not established.')]
      : []),
    ...(fact.kind === 'arable-land' || fact.catalogSource?.kind === 'plant-product'
      ? [unknown('cultivated-crop', 'Cultivation and harvested crops are not established.')]
      : []),
    ...(fact.catalogSource?.kind === 'species-product'
      ? [unknown('domesticated-source', 'Species presence does not establish domestication.')]
      : []),
  ];
}
/** These options describe one supported meaning, never the technical explanation. */
export function resourceNarrativeOptions(fact: ResourceFact): string[] {
  const presence = fact.assessments?.find((entry) => entry.topic === 'resource-presence');
  if (
    !presence ||
    presence.status === 'unknown' ||
    !['available', 'limited'].includes(fact.availability)
  )
    return [];
  if (fact.kind === 'arable-land')
    return [
      'The ground here could support cultivation.',
      'This land offers a possibility for cultivation.',
    ];
  if (fact.kind === 'freshwater')
    return fact.name === 'Lake water'
      ? ['A lake offers a freshwater source.', 'A lake in the region offers freshwater.']
      : ['A river provides a freshwater source.', 'The river offers a source of freshwater.'];
  if (presence.status === 'confirmed' && fact.depositIds.length)
    return [
      `Deposits of ${fact.name} occur here.`,
      `${fact.name.charAt(0).toUpperCase()}${fact.name.slice(1)} deposits lie in this country.`,
    ];
  return [
    `Sources in the region could provide ${fact.name}.`,
    `${fact.name.charAt(0).toUpperCase()}${fact.name.slice(1)} could be obtained from sources in the region.`,
  ];
}
export function describeResource(fact: ResourceFact, rng: RNG): string {
  const options = resourceNarrativeOptions(fact);
  if (!options.length) return '';
  return composeNarrative(
    {
      id: fact.id,
      kind: 'regional-resource',
      candidates: [
        {
          id: `${fact.id}:presence`,
          topic: 'resource',
          importance: 'defining',
          sourceIds: [fact.id],
          templates: [{ id: 'resource:presence', parts: [{ id: 'sentence', options }] }],
        },
      ],
    },
    { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 0 },
    { recentSelections: [] },
    rng,
  ).text;
}
export function riverAssessments(sources: FactSource[], road: boolean): RegionFactAssessment[] {
  return [
    {
      topic: 'river-presence',
      status: 'confirmed',
      explanation: 'A river is recorded on this edge.',
      sources: sources.filter(
        (source) => source.kind === 'map-edge' && source.property === 'river',
      ),
    },
    {
      topic: 'road-at-river',
      status: road ? 'confirmed' : 'unknown',
      explanation: road
        ? 'A road meets this river edge; no crossing structure is established.'
        : 'No road is mapped on this edge; this does not establish a detour or impassability.',
      sources: sources.filter((source) => source.kind === 'map-edge' && source.property === 'road'),
    },
    {
      topic: 'safe-crossing',
      status: 'unknown',
      explanation: 'Crossing safety is unverified.',
      sources: [],
    },
    {
      topic: 'river-navigability',
      status: 'unknown',
      explanation: 'River navigability is unverified.',
      sources: [],
    },
  ];
}
