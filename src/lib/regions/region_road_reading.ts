import { notableEditorialCandidates } from './region_notable_candidates';
import {
  readableRoad,
  observedRoad,
  roadNetworkObservation,
  roadPromptSupports,
} from './region_road_evidence';
import type { RegionSnapshot } from './region_snapshot';
import type { FactSource, MapNodeFactProperty, RouteFact } from './region_fact_types';
import type { RegionEditorialCandidate } from './region_editorial_types';
import type { RegionRoadReading } from './region_road_reading_types';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Complete directory metadata. No words or random selection are generated here. */
export function buildRoadReadings(snapshot: RegionSnapshot): RegionRoadReading[] {
  return snapshot.facts.routes
    .filter((route) => readableRoad(snapshot, route))
    .sort((a, b) => lexical(a.id, b.id))
    .map((route) => ({
      routeId: route.id,
      reason: {
        ruleId: 'fantasy:region:road-reading:v1',
        status: 'current',
        sources: [{ kind: 'fact', factId: route.id }],
      },
      observations: [{ kind: 'road-path', ...observedRoad(route)! }],
    }));
}

/** All distinctive path meanings compete in the common plan; ordinary terrain earns no filler. */
export function roadReadingCandidates(snapshot: RegionSnapshot): RegionEditorialCandidate[] {
  const candidates: RegionEditorialCandidate[] = [];
  const routes = snapshot.facts.routes
    .filter((route) => route.origin !== 'authored' && readableRoad(snapshot, route))
    .sort((a, b) => lexical(a.id, b.id));
  const add = (
    route: RouteFact | undefined,
    key: string,
    text: string,
    sources: FactSource[],
    assertions: string[],
    consequence = false,
  ) => {
    const id = `editorial:road:${route?.id ?? 'network'}:${key}`;
    candidates.push({
      narrative: {
        id,
        topic: `road-${key}`,
        importance: 'distinctive',
        sourceIds: route ? [route.id] : [],
        templates: [
          {
            id: `editorial:road:${key.split('-')[0]}`,
            parts: [{ id: 'sentence', options: [text] }],
          },
        ],
      },
      subjectKey: route?.id ?? 'road-network',
      assertionKeys: assertions,
      destinations: [{ section: 'travel', ...(route ? { routeId: route.id } : {}) }],
      priority: {
        residentConsequence: consequence,
        connectsSubjects: true,
        locatedDetail: !!route,
        peerSupportCount: 0,
      },
      sources: [
        ...(route
          ? [{ kind: 'fact' as const, factId: route.id }]
          : roadNetworkObservation(snapshot).roads.map((road) => ({
              kind: 'fact' as const,
              factId: road.routeId,
            }))),
        ...sources,
      ],
      observations: route
        ? [{ kind: 'road-path', ...observedRoad(route)! }]
        : [roadNetworkObservation(snapshot)],
    });
  };
  const notableCandidates = notableEditorialCandidates(snapshot);
  const ownedByNotable = (route: RouteFact, family: string, nodeOrEdgeId: number) =>
    notableCandidates.prompts.some(
      (prompt) =>
        prompt.familyId === family &&
        roadPromptSupports(snapshot, route, prompt.notableId, prompt.familyId) &&
        snapshot.facts.notables.some(
          (fact) =>
            fact.id === prompt.notableId &&
            (family === 'passage' ? fact.anchor?.edgeIds : fact.anchor?.nodeIds)?.includes(
              nodeOrEdgeId,
            ),
        ),
    );
  const ownedCrossings = new Set<number>();
  for (const route of routes) {
    const nodes = route.anchor.nodeIds.flatMap((id) =>
      snapshot.map.nodes.filter((node) => node.id === id),
    );
    for (const edgeId of route.anchor.edgeIds) {
      const edge = snapshot.map.edges.find((entry) => entry.id === edgeId)!;
      if (edge.river <= 0 || ownedCrossings.has(edgeId) || ownedByNotable(route, 'passage', edgeId))
        continue;
      ownedCrossings.add(edgeId);
      add(
        route,
        `river-${edgeId}`,
        'This saved route meets a river along its land path.',
        [{ kind: 'map-edge', edgeId, property: 'river', observedValue: String(edge.river) }],
        [`road-river:${edgeId}`],
        true,
      );
    }
    const meanings: {
      key: string;
      properties: MapNodeFactProperty[];
      ids: number[];
      text: string;
      consequence?: boolean;
    }[] = [
      {
        key: 'coast',
        properties: ['isCoast'],
        ids: nodes.filter((node) => node.isCoast).map((node) => node.id),
        text: 'Part of this saved route passes through coastal country.',
      },
      {
        key: 'cold',
        properties: ['temperature'],
        ids: nodes.filter((node) => node.temperature <= 0).map((node) => node.id),
        text: 'Part of this saved route crosses freezing country, making exposure a travel concern.',
        consequence: true,
      },
      {
        key: 'dry',
        properties: ['temperature', 'moisture'],
        ids: nodes
          .filter((node) => node.temperature >= 30 && node.moisture <= 0.2)
          .map((node) => node.id),
        text: 'Part of this saved route crosses hot, dry country, making water planning a travel concern.',
        consequence: true,
      },
    ];
    for (const meaning of meanings) {
      if (!meaning.ids.length) continue;
      const family =
        meaning.key === 'cold' ? 'exposure' : meaning.key === 'dry' ? 'water-provision' : '';
      if (family && meaning.ids.every((id) => ownedByNotable(route, family, id))) continue;
      add(
        route,
        meaning.key,
        meaning.text,
        meaning.ids.flatMap((nodeId) =>
          meaning.properties.map(
            (property): FactSource => ({
              kind: 'map-node',
              nodeId,
              property,
              observedValue: String(nodes.find((node) => node.id === nodeId)![property]),
            }),
          ),
        ),
        [...meaning.ids].sort((a, b) => a - b).map((id) => `road-${meaning.key}:${id}`),
        meaning.consequence,
      );
    }
  }
  // A concern common to every eligible route is one network meaning, not one paragraph per path.
  const network = roadNetworkObservation(snapshot);
  if (
    routes.length >= 2 &&
    routes.length === snapshot.facts.routes.filter((route) => route.kind === 'road').length &&
    network.roads.length === routes.length &&
    network.roads.every((road) => routes.some((route) => route.id === road.routeId))
  ) {
    for (const [key, text] of [
      ['coast', 'All saved road routes pass through coastal country along part of their paths.'],
      [
        'cold',
        'All saved road routes cross freezing country along part of their paths, making exposure a travel concern.',
      ],
      [
        'dry',
        'All saved road routes cross hot, dry country along part of their paths, making water planning a travel concern.',
      ],
    ]) {
      const matching = candidates.filter((candidate) => candidate.narrative.id.endsWith(`:${key}`));
      if (matching.length !== routes.length) continue;
      const sources = matching.flatMap((candidate) =>
        candidate.sources.filter((source) => source.kind !== 'fact'),
      );
      add(
        undefined,
        key,
        text,
        sources,
        [...new Set(matching.flatMap((candidate) => candidate.assertionKeys))],
        key !== 'coast',
      );
      const shared = candidates.at(-1)!;
      shared.priority.locatedDetail = true;
      for (const candidate of matching) candidates.splice(candidates.indexOf(candidate), 1);
    }
  }
  const adjacency = new Map(network.settlementIds.map((id) => [id, new Set<string>()]));
  for (const road of network.roads) {
    const [a, b] = road.endpoints;
    if (a.kind !== 'embedded' || b.kind !== 'embedded') continue;
    adjacency.get(a.settlementId)!.add(b.settlementId);
    adjacency.get(b.settlementId)!.add(a.settlementId);
  }
  const visited = new Set<string>();
  let groups = 0;
  for (const id of network.settlementIds) {
    if (!adjacency.get(id)!.size || visited.has(id)) continue;
    groups++;
    const queue = [id];
    for (let i = 0; i < queue.length; i++) {
      if (visited.has(queue[i])) continue;
      visited.add(queue[i]);
      queue.push(...adjacency.get(queue[i])!);
    }
  }
  if (groups > 1)
    add(
      undefined,
      'groups',
      `The saved road routes form ${groups} separate groups.`,
      [],
      ['road-network:groups'],
    );
  const unlinked = network.settlementIds.length - visited.size;
  if (network.roads.length && unlinked)
    add(
      undefined,
      'unlinked',
      `${unlinked} recorded ${unlinked === 1 ? 'settlement has' : 'settlements have'} no eligible saved road route.`,
      [],
      ['road-network:unlinked'],
    );
  return candidates;
}

/** Assign shared owners only after selection; no hidden duplicate sentences or suggestions. */
export function assignRoadReadingOwners(snapshot: RegionSnapshot): void {
  const gazetteer = snapshot.gazetteer;
  if (gazetteer?.version !== 4) return;
  for (const reading of gazetteer.roadReadings) {
    const route = snapshot.facts.routes.find((route) => route.id === reading.routeId)!;
    if (route.origin === 'authored') continue;
    const ownDetail = gazetteer.blocks.some(
      (block) =>
        block.destination.routeId === route.id &&
        block.sentences.some((sentence) =>
          sentence.reason.sources.some(
            (source) => source.kind === 'map-edge' && source.property === 'river',
          ),
        ),
    );
    if (!ownDetail) {
      const block = gazetteer.blocks.find(
        (block) =>
          block.destination.routeId &&
          block.destination.routeId !== route.id &&
          block.sentences.some((sentence) =>
            sentence.reason.sources.some(
              (source) =>
                source.kind === 'map-edge' &&
                source.property === 'river' &&
                route.anchor.edgeIds.includes(source.edgeId),
            ),
          ),
      );
      if (block?.destination.routeId) reading.detailOwnerRouteId = block.destination.routeId;
    }
    const prompt = gazetteer.notableReadings.find(
      (notable) =>
        notable.prompt &&
        roadPromptSupports(snapshot, route, notable.notableId, notable.prompt.familyId),
    );
    if (prompt) reading.promptNotableId = prompt.notableId;
  }
}
