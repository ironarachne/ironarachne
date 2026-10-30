import type { RegionSnapshot } from './region_snapshot';
import type { RegionLandscapePlace } from './region_landscape_reading_types';
import type { RegionEditorialCandidate } from './region_editorial_types';
import type { FactBase } from './region_fact_types';
import { createRegionEvidenceChecker } from './region_context_evidence';
import {
  landscapeExtent,
  landscapeFootprintObservation,
  landscapeObservationCurrent,
} from './region_landscape_extent';
import { biomePhrase } from './region_narrative';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
export const landscapePlaceAnchor = (id: string) =>
  `landscape-${encodeURIComponent(id).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)}`;
export const landscapeOwnerHeading = (owner: RegionLandscapePlace['owner']) =>
  owner === 'landscape' ? 'Landscape' : 'Notable places';
export const landscapePlaceFactIds = (place: RegionLandscapePlace) => [
  place.primaryFactId,
  ...place.aliasFactIds,
];
export function landscapeFacts(snapshot: Pick<RegionSnapshot, 'facts'>): FactBase[] {
  return [
    ...snapshot.facts.areas,
    ...snapshot.facts.mountainRanges,
    ...snapshot.facts.denseForests,
    ...snapshot.facts.notables,
  ];
}

/** Explicit forest support establishes aliases; overlap and equal names never do. */
export function buildLandscapePlaces(snapshot: RegionSnapshot): RegionLandscapePlace[] {
  const current = createRegionEvidenceChecker(snapshot);
  const geometric = [
    ...snapshot.facts.areas.filter((fact) => fact.id.startsWith('area:habitat-zone:')),
    ...snapshot.facts.mountainRanges,
    ...snapshot.facts.denseForests,
  ].sort((a, b) => lexical(a.id, b.id));
  const result: RegionLandscapePlace[] = [];
  for (const fact of geometric) {
    const forests = snapshot.facts.denseForests;
    const forest = forests.some((entry) => entry.id === fact.id);
    const aliases = forest
      ? snapshot.facts.notables.filter(
          (notable) =>
            notable.kind === 'landmark' &&
            notable.reason?.sources.some(
              (source) => source.kind === 'fact' && source.factId === fact.id,
            ),
        )
      : [];
    const promoted =
      aliases.length === 1 &&
      aliases[0].reason?.sources.filter(
        (source) => source.kind === 'fact' && forests.some((entry) => entry.id === source.factId),
      ).length === 1
        ? aliases[0]
        : undefined;
    const named = !forest || promoted !== undefined || fact.origin === 'authored';
    const observation = landscapeFootprintObservation(snapshot, [fact.id]);
    const extent = landscapeExtent(observation);
    if (!named && (!current(fact) || !extent || extent.small)) continue;
    const place: RegionLandscapePlace = {
      id: fact.id,
      primaryFactId: promoted?.id ?? fact.id,
      aliasFactIds: promoted ? [fact.id] : [],
      owner: promoted ? 'notable-place' : 'landscape',
      reason: {
        ruleId: 'fantasy:region:landscape-place:v1',
        status: 'current',
        sources: [...new Set([fact.id, ...(promoted ? [promoted.id] : []), 'area:land'])]
          .sort(lexical)
          .map((factId) => ({ kind: 'fact', factId })),
      },
      observations: [observation, landscapeFootprintObservation(snapshot, ['area:land'])],
    };
    if (!named && extent) {
      place.descriptor = `Dense forest ${extent.location}`;
      const parents = snapshot.facts.areas
        .filter(
          (area) =>
            area.id.startsWith('area:habitat-zone:') &&
            area.name.trim() &&
            current(area) &&
            fact.mapNodeIds.every((id) => area.mapNodeIds.includes(id)),
        )
        .sort((a, b) => a.mapNodeIds.length - b.mapNodeIds.length || lexical(a.id, b.id));
      if (parents[0]) {
        place.descriptor += ` within ${parents[0].name}`;
        place.reason.sources.push({ kind: 'fact', factId: parents[0].id });
        place.observations.push(landscapeFootprintObservation(snapshot, [parents[0].id]));
      }
    }
    result.push(place);
  }
  // Equal geographic descriptors identify a readable group, never one connected forest.
  const grouped: RegionLandscapePlace[] = [];
  for (const place of result) {
    const peers = place.descriptor
      ? result.filter((entry) => entry.descriptor === place.descriptor)
      : [place];
    if (peers[0] !== place) continue;
    if (peers.length > 1) {
      const ids = peers.map((entry) => entry.primaryFactId).sort(lexical);
      grouped.push({
        ...place,
        aliasFactIds: ids.slice(1),
        descriptor: 'Dense forest patches',
        reason: {
          ...place.reason,
          sources: [
            ...new Set(
              peers.flatMap((entry) =>
                entry.reason.sources.flatMap((source) =>
                  source.kind === 'fact' ? [source.factId] : [],
                ),
              ),
            ),
          ]
            .sort(lexical)
            .map((factId) => ({ kind: 'fact', factId })),
        },
        observations: [
          landscapeFootprintObservation(snapshot, ids),
          landscapeFootprintObservation(snapshot, ['area:land']),
        ],
      });
    } else grouped.push(place);
  }
  return grouped;
}

export function landscapePlaceCurrent(
  snapshot: RegionSnapshot,
  place: RegionLandscapePlace,
): boolean {
  const ids = landscapePlaceFactIds(place);
  const all = landscapeFacts(snapshot);
  if (
    place.descriptor &&
    place.reason.sources.some(
      (source) =>
        source.kind === 'fact' &&
        all.some((fact) => fact.id === source.factId && fact.origin === 'authored'),
    )
  )
    return false;
  if (ids.some((id) => !all.some((fact) => fact.id === id))) return false;
  // A changed explicit alias relationship cannot silently keep an obsolete owner.
  if (place.owner === 'notable-place') {
    const primary = snapshot.facts.notables.find((fact) => fact.id === place.primaryFactId);
    if (
      !primary ||
      !place.aliasFactIds.every((id) =>
        primary.reason?.sources.some((source) => source.kind === 'fact' && source.factId === id),
      )
    )
      return false;
  }
  return (
    createRegionEvidenceChecker(snapshot)({
      id: `place:${place.id}`,
      name: '',
      description: '',
      origin: 'generated',
      reason: place.reason,
    }) &&
    place.observations.every((observation) => landscapeObservationCurrent(snapshot, observation))
  );
}

/** Candidates contribute located extent/canopy assertions, never source-description copies. */
export function landscapeReadingCandidates(
  snapshot: RegionSnapshot,
  places: RegionLandscapePlace[],
): RegionEditorialCandidate[] {
  const current = createRegionEvidenceChecker(snapshot);
  const facts = landscapeFacts(snapshot);
  return places.flatMap((place): RegionEditorialCandidate[] => {
    const support = landscapePlaceFactIds(place).map((id) => facts.find((fact) => fact.id === id));
    if (
      !landscapePlaceCurrent(snapshot, place) ||
      support.some((fact) => !fact || fact.origin === 'authored' || !current(fact))
    )
      return [];
    const primary = support[0]!;
    const extent = landscapeExtent(place.observations[0]);
    if (!extent) return [];
    const geometricId = place.observations[0].footprints[0].factId;
    const zone = snapshot.facts.areas.find((fact) => fact.id === geometricId);
    const forest = snapshot.facts.denseForests.some((fact) => fact.id === geometricId);
    const biome = zone
      ? snapshot.map.nodes.find((node) => node.id === zone.mapNodeIds[0])?.biomeId
      : undefined;
    const relation =
      zone &&
      [...snapshot.facts.settlementRoles, ...snapshot.facts.routes].some(
        (fact) => fact.areaIds.includes(zone.id) && current(fact),
      );
    if (zone && extent.small && !relation) return [];
    const name = place.descriptor ?? primary.name;
    if (!name.trim()) return [];
    const identity = forest
      ? place.aliasFactIds.length && place.owner === 'landscape'
        ? 'dense forest patches'
        : 'dense forest'
      : biome
        ? biomePhrase(biome)
        : 'mountain country';
    const grouped = Boolean(place.descriptor && place.aliasFactIds.length);
    const phrase = grouped
      ? extent.phrase.replace(
          /^(covers|forms|lies|extends|stretches)\b/,
          (verb) =>
            ({
              covers: 'cover',
              forms: 'form',
              lies: 'lie',
              extends: 'extend',
              stretches: 'stretch',
            })[verb]!,
        )
      : extent.phrase;
    const subject = place.descriptor
      ? grouped
        ? 'Dense forest patches'
        : 'Dense canopy'
      : `${name}: ${extent.small ? 'a small patch of ' : ''}${forest ? 'dense canopy' : identity}`;
    const text = `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${phrase}.`;
    const assertionKeys = place.observations[0].footprints.map(
      (entry) => `landscape-extent:${entry.factId}`,
    );
    return [
      {
        narrative: {
          id: `editorial:landscape-place:${place.id}`,
          topic: 'landscape',
          importance: 'distinctive',
          sourceIds: landscapePlaceFactIds(place).sort(lexical),
          templates: [
            {
              id: `editorial:landscape-place:${forest ? 'forest' : zone ? 'zone' : 'range'}`,
              parts: [{ id: 'sentence', options: [text] }],
            },
          ],
        },
        subjectKey: place.id,
        assertionKeys,
        destinations: [{ section: place.owner, landscapePlaceId: place.id }],
        priority: {
          residentConsequence: false,
          connectsSubjects: place.owner === 'notable-place',
          locatedDetail: true,
          peerSupportCount: 0,
        },
        sources: place.reason.sources,
        observations: place.observations,
      },
    ];
  });
}
