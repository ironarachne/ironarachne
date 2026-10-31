import { createRegionEvidenceChecker } from './region_context_evidence';
import { overviewRoad } from './region_geography_narrative';
import { notableEvidenceKey } from './region_notable_identity';
import type { RouteFact } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type {
  RegionObservedRoad,
  RegionRoadNetworkObservation,
  RegionRoadReading,
} from './region_road_reading_types';

export function observedRoad(route: RouteFact): RegionObservedRoad | undefined {
  const [start, end] = route.endpoints;
  if (route.kind !== 'road' || start.kind !== 'settlement' || end.kind !== 'settlement')
    return undefined;
  return {
    routeId: route.id,
    endpoints: [{ ...start.settlement }, { ...end.settlement }],
    anchor: { nodeIds: [...route.anchor.nodeIds], edgeIds: [...route.anchor.edgeIds] },
  };
}

/** Validate geometry even when a referenced endpoint has no locally available position. */
export function readableRoad(snapshot: RegionSnapshot, route: RouteFact): boolean {
  const observed = observedRoad(route);
  if (!observed || !createRegionEvidenceChecker(snapshot)(route)) return false;
  const nodes = route.anchor.nodeIds;
  if (
    nodes.length < 2 ||
    new Set(nodes).size !== nodes.length ||
    route.anchor.edgeIds.length !== nodes.length - 1
  )
    return false;
  if (
    nodes.some(
      (id) => !snapshot.map.nodes.some((node) => node.id === id && !node.isWater && !node.isOcean),
    )
  )
    return false;
  if (
    route.anchor.edgeIds.some(
      (id, index) =>
        !snapshot.map.edges.some(
          (edge) =>
            edge.id === id &&
            (edge.road ?? 0) > 0 &&
            ((edge.d0 === nodes[index] && edge.d1 === nodes[index + 1]) ||
              (edge.d1 === nodes[index] && edge.d0 === nodes[index + 1])),
        ),
    )
  )
    return false;
  return observed.endpoints.every(
    (target, index) =>
      target.kind === 'artifact' ||
      snapshot.settlements.some(
        (entry) =>
          entry.id === target.settlementId &&
          entry.snapshot.mapNodeId === (index ? nodes.at(-1) : nodes[0]),
      ),
  );
}

export function currentEmbeddedRoads(snapshot: RegionSnapshot) {
  const context = {
    map: snapshot.map,
    settlementIds: snapshot.settlements.map((entry) => entry.id),
    settlements: snapshot.settlements.map((entry) => entry.snapshot),
  };
  const current = createRegionEvidenceChecker(snapshot);
  return snapshot.facts.routes
    .filter((route) => route.kind === 'road' && current(route))
    .flatMap((route) => {
      const road = overviewRoad(context, route);
      const ids = route.endpoints.flatMap((endpoint) =>
        endpoint.kind === 'settlement' && endpoint.settlement.kind === 'embedded'
          ? [endpoint.settlement.settlementId]
          : [],
      );
      return road && ids.length === 2 ? [{ route, road, ids }] : [];
    })
    .sort((a, b) => (a.route.id < b.route.id ? -1 : a.route.id > b.route.id ? 1 : 0));
}

export function roadNetworkObservation(snapshot: RegionSnapshot): RegionRoadNetworkObservation {
  return {
    kind: 'road-network',
    settlementIds: snapshot.settlements.map((entry) => entry.id).sort(),
    roads: currentEmbeddedRoads(snapshot).map(({ route }) => observedRoad(route)!),
  };
}

export function roadPathCurrent(snapshot: RegionSnapshot, observed: RegionObservedRoad) {
  const route = snapshot.facts.routes.find((entry) => entry.id === observed.routeId);
  return (
    !!route &&
    readableRoad(snapshot, route) &&
    notableEvidenceKey(observedRoad(route)) ===
      notableEvidenceKey({
        routeId: observed.routeId,
        endpoints: observed.endpoints,
        anchor: observed.anchor,
      })
  );
}

/** A suggestion may be referenced only for the same located travel constraint. */
export function roadPromptSupports(
  snapshot: RegionSnapshot,
  route: RouteFact,
  notableId: string,
  familyId: string,
): boolean {
  const notable = snapshot.facts.notables.find((fact) => fact.id === notableId);
  if (!notable || !createRegionEvidenceChecker(snapshot)(notable)) return false;
  if (familyId === 'passage')
    return !!notable.anchor?.edgeIds.some(
      (id) =>
        route.anchor.edgeIds.includes(id) &&
        snapshot.map.edges.some((edge) => edge.id === id && edge.river > 0 && (edge.road ?? 0) > 0),
    );
  if (familyId !== 'exposure' && familyId !== 'water-provision' && familyId !== 'terrain-passage')
    return false;
  return !!notable.anchor?.nodeIds.some((id) => route.anchor.nodeIds.includes(id));
}

export function roadReadingRelationsCurrent(
  snapshot: RegionSnapshot,
  reading: RegionRoadReading,
): boolean {
  const gazetteer = snapshot.gazetteer;
  const route = snapshot.facts.routes.find((route) => route.id === reading.routeId);
  if ((gazetteer?.version !== 4 && gazetteer?.version !== 5) || !route) return false;
  if (reading.detailOwnerRouteId) {
    const owner = gazetteer.roadReadings.find(
      (entry) => entry.routeId === reading.detailOwnerRouteId,
    );
    const ownerRoute = snapshot.facts.routes.find((entry) => entry.id === owner?.routeId);
    if (
      !owner ||
      owner.detailOwnerRouteId ||
      !ownerRoute ||
      !owner.observations.every(
        (observation) => observation.kind === 'road-path' && roadPathCurrent(snapshot, observation),
      ) ||
      !route.anchor.edgeIds.some(
        (id) =>
          ownerRoute.anchor.edgeIds.includes(id) &&
          snapshot.map.edges.some((edge) => edge.id === id && edge.river > 0),
      )
    )
      return false;
  }
  if (reading.promptNotableId) {
    const notable = gazetteer.notableReadings.find(
      (entry) => entry.notableId === reading.promptNotableId,
    );
    if (
      !notable?.prompt ||
      notable.reason.status === 'stale' ||
      notable.prompt.sentence.reason.status === 'stale' ||
      !roadPromptSupports(snapshot, route, notable.notableId, notable.prompt.familyId)
    )
      return false;
  }
  return true;
}
