import { editorialSentenceCount } from './region_editorial_policy';
import { Climates } from '$lib/environment';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { notableApproachRole, notableHeading, notableReading } from './region_notable_identity';
import type { RegionSnapshot } from './region_snapshot';
import type { NotableFact, FactSource } from './region_fact_types';
import type {
  RegionEditorialCandidate,
  RegionEditorialObservation,
} from './region_editorial_types';
import type {
  RegionNotablePromptCandidate,
  RegionNotableReading,
} from './region_notable_reading_types';

const factSources = (fact: NotableFact) =>
  (fact.reason?.sources ?? []).flatMap((source) => (source.kind === 'fact' ? [source.factId] : []));

/** Domain rules supply meanings, never interpret arbitrary saved description text as evidence. */
export function notableEditorialCandidates(snapshot: RegionSnapshot): {
  descriptions: RegionEditorialCandidate[];
  prompts: RegionNotablePromptCandidate[];
  readings: RegionNotableReading[];
} {
  const current = createRegionEvidenceChecker(snapshot);
  const descriptions: RegionEditorialCandidate[] = [];
  const prompts: RegionNotablePromptCandidate[] = [];
  const readings: RegionNotableReading[] = [];
  for (const fact of [...snapshot.facts.notables].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  )) {
    if (fact.origin === 'authored' || !current(fact) || !fact.anchor?.nodeIds.length) continue;
    const reading = notableReading(snapshot, fact);
    readings.push(reading);
    const role = notableApproachRole(snapshot, fact);
    const heading = notableHeading(snapshot, fact);
    const nodes = snapshot.map.nodes
      .filter((node) => fact.anchor!.nodeIds.includes(node.id) && !node.isWater && !node.isOcean)
      .sort((a, b) => a.id - b.id);
    if (!nodes.length) continue;
    const meetings = snapshot.map.edges
      .filter(
        (edge) =>
          fact.anchor!.edgeIds.includes(edge.id) &&
          edge.river > 0 &&
          (edge.road ?? 0) > 0 &&
          nodes.some((node) => node.id === edge.d0 || node.id === edge.d1),
      )
      .sort((a, b) => a.id - b.id);
    const sources: FactSource[] = [{ kind: 'fact', factId: fact.id }];
    const observations: RegionEditorialObservation[] = [];
    // Complete observations catch a retargeted role and a renamed subject without rewriting words.
    if (reading.subject) {
      if (reading.subject.kind === 'settlement' && reading.subject.target.kind === 'artifact')
        continue;
      const name =
        reading.subject.kind === 'settlement'
          ? snapshot.settlements.find(
              (entry) =>
                reading.subject?.kind === 'settlement' &&
                reading.subject.target.kind === 'embedded' &&
                entry.id === reading.subject.target.settlementId,
            )?.snapshot.name
          : snapshot.facts.denseForests.find(
              (entry) => reading.subject?.kind === 'fact' && entry.id === reading.subject.factId,
            )?.name;
      if (!name?.trim()) continue;
      observations.push({ kind: 'notable-name', subject: reading.subject, observedName: name });
    }
    let description = '';
    let family = '';
    let options: string[] = [];
    const rule = fact.reason?.ruleId;
    if (role && meetings.length && reading.subject) {
      description = `${heading} meets a road and river, making passage a route-planning concern.`;
      family = 'passage';
      options = [
        `Before taking travelers along ${heading.toLowerCase().startsWith('approach to ') ? `the approach to ${heading.slice(12)}` : heading}, assess passage at the road–river meeting and decide whether to proceed or turn back.`,
        `Assess the road–river meeting on the ${heading.charAt(0).toLowerCase()}${heading.slice(1)} before choosing whether to lead travelers onward or turn back.`,
      ];
    } else if (rule === 'fantasy:region:river-meeting:v1' && meetings.length) {
      description = 'A road meets the river here, making passage a route-planning concern.';
      family = 'passage';
      options = [
        'Assess passage at this road–river meeting and decide whether to proceed or turn back.',
        'Before leading travelers onward, examine passage at this road–river meeting and choose whether to continue or retreat.',
      ];
    } else if (rule === 'fantasy:region:ecology-bank-gathering:v1') {
      const ids = factSources(fact);
      const use = snapshot.facts.ecologyRelationships.find(
        (entry) => ids.includes(entry.id) && entry.relation.kind === 'used-by',
      );
      const inhabitant = snapshot.facts.ecologyInhabitants.find((entry) => ids.includes(entry.id));
      if (!use || !inhabitant || !current(use) || !current(inhabitant)) continue;
      description = `Gathering at this freshwater patch shares ground with the local ${inhabitant.name} population and calls for care.`;
      family = 'harvest-risk';
      options = [
        `Attempt a gathering trip at this patch, deciding whether to risk the recorded ${inhabitant.name} danger or abandon the harvest.`,
        `Choose whether to gather at this freshwater patch despite the local ${inhabitant.name} danger or leave the harvest behind.`,
      ];
      observations.push({
        kind: 'notable-name',
        subject: { kind: 'fact', factId: inhabitant.id },
        observedName: inhabitant.name,
      });
    } else if (rule === 'fantasy:region:resource-reach:v1') {
      const source = snapshot.facts.resourceSources.find(
        (entry) =>
          factSources(fact).includes(entry.id) && entry.requirements.length && current(entry),
      );
      if (!source) {
        const limited = snapshot.facts.resources.find(
          (entry) =>
            factSources(fact).includes(entry.id) &&
            entry.availability === 'limited' &&
            current(entry),
        );
        if (!limited) continue;
        description = `${limited.name} is available in limited supply at this reach.`;
        observations.push({
          kind: 'notable-name',
          subject: { kind: 'fact', factId: limited.id },
          observedName: limited.name,
        });
      } else {
        description = `${source.name} offers a collection opportunity requiring ${source.requirements.join(' and ')}.`;
        family = 'collection-requirement';
        options = [
          `Plan collection at ${source.name} and decide whether securing ${source.requirements.join(' and ')} is worth attempting the expedition.`,
          `Weigh the requirement for ${source.requirements.join(' and ')} before choosing whether to attempt collection at ${source.name}.`,
        ];
        observations.push({
          kind: 'notable-name',
          subject: { kind: 'fact', factId: source.id },
          observedName: source.name,
        });
      }
    } else if (
      rule === 'fantasy:region:high-ground-obstacle:v1' &&
      nodes.some((node) => node.elevation >= 0.65)
    ) {
      description = 'High ground complicates overland route planning.';
      family = 'terrain-passage';
      options = [
        'Scout this high-ground traverse and choose whether to attempt the ascent or turn back.',
        'Examine the high terrain before deciding whether to lead travelers up this traverse or abandon the approach.',
      ];
    } else if (rule === 'fantasy:region:cold-travel:v1') {
      const site = Climates.siteTemperature(snapshot.environment.climate, nodes[0].temperature);
      if (site.coldestMonth > 0) continue;
      const season = site.coldestSeason.trim() ? ` during ${site.coldestSeason}` : '';
      description = `Freezing temperatures${season} make exposure a travel concern.`;
      family = 'exposure';
      options = [
        `Plan passage through this cold country${season}, choosing whether to prepare for exposure or postpone the journey.`,
        `Decide whether to prepare for freezing exposure${season} before crossing this country or defer the journey.`,
      ];
    } else if (
      rule === 'fantasy:region:hot-dry-travel:v1' &&
      nodes.some(
        (node) =>
          Climates.siteTemperature(snapshot.environment.climate, node.temperature).warmestMonth >=
            25 && node.moisture <= 0.2,
      )
    ) {
      description = 'Heat and dry conditions make water planning a travel concern.';
      family = 'water-provision';
      options = [
        'Plan water supplies for this hot, dry traverse and decide whether to attempt passage or postpone the journey.',
        'Choose whether to provision water for passage through this hot, dry country or abandon the traverse.',
      ];
    }
    if (!description || editorialSentenceCount(description) !== 1) continue;
    options = options.filter((text) => editorialSentenceCount(text) === 1);
    for (const edge of meetings)
      sources.push(
        { kind: 'map-edge', edgeId: edge.id, property: 'river', observedValue: String(edge.river) },
        { kind: 'map-edge', edgeId: edge.id, property: 'road', observedValue: String(edge.road) },
      );
    const editorial: RegionEditorialCandidate = {
      narrative: {
        id: `notable-description:${fact.id}`,
        topic: fact.kind === 'hazard' ? 'hazard' : 'access',
        importance: family === 'harvest-risk' ? 'defining' : 'distinctive',
        sourceIds: [fact.id],
        templates: [
          {
            id: `notable-description:${rule}`,
            parts: [{ id: 'sentence', options: [description] }],
          },
        ],
      },
      subjectKey: fact.id,
      assertionKeys: [
        family === 'passage'
          ? `road-river:${meetings
              .map((edge) => edge.id)
              .sort((a, b) => a - b)
              .join(':')}`
          : `notable:${fact.id}`,
      ],
      destinations: [
        { section: fact.kind === 'hazard' ? 'hazards' : 'notable-place', notableId: fact.id },
      ],
      priority: {
        residentConsequence: true,
        connectsSubjects: !!role || family === 'harvest-risk',
        locatedDetail: true,
        peerSupportCount: 0,
      },
      sources,
      observations,
    };
    descriptions.push(editorial);
    if (options.length)
      prompts.push({
        notableId: fact.id,
        familyId: family,
        editorial: {
          ...editorial,
          assertionKeys: [`suggestion:${family}:${fact.id}`],
          narrative: {
            ...editorial.narrative,
            id: `notable-prompt:${fact.id}`,
            topic: 'suggested-adventure',
            templates: [
              { id: `notable-prompt:${family}:v1`, parts: [{ id: 'sentence', options }] },
            ],
          },
        },
      });
  }
  return { descriptions, prompts, readings };
}
