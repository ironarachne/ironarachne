import { distancePointToSegmentSquared, type Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import { RIVER_LIMITS, type RiverChannelReach, type RiverNetwork } from './river_network_types';
import {
  pointInRiverPolygon,
  riverEnvelope,
  riverPolygonArea,
  riverSegmentIntersection,
  riverTerrainElevation,
  riverTolerance,
  simpleRiverPolygon,
  closestRiverPoint,
  riverPolygonsOverlap,
} from './river_geometry';
import { buildRoadCentroidPolylines, minDistanceSquaredToRoadPolylines } from './road_polylines';
import { riverSizeClass } from './river_network';

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const point = (value: unknown): value is Vertex => {
  const p = record(value);
  return p !== null && finite(p.x) && finite(p.y);
};
const ids = (value: unknown, size: number): value is number[] =>
  Array.isArray(value) &&
  value.length <= size &&
  value.every((id) => Number.isInteger(id) && id >= 0 && id < size) &&
  new Set(value).size === value.length;

/** Only network-bearing maps require the full graph contract; old saves keep their acceptance policy. */
export function riverGraphError(value: unknown): string | null {
  const map = record(value);
  if (
    !map ||
    !finite(map.width) ||
    !finite(map.height) ||
    map.width <= 0 ||
    map.height <= 0 ||
    map.width > RIVER_LIMITS.maxDimension ||
    map.height > RIVER_LIMITS.maxDimension
  )
    return 'River map needs positive finite dimensions';
  if (
    ![map.nodes, map.edges, map.corners].every(
      (list) => Array.isArray(list) && list.length <= RIVER_LIMITS.graphEntries,
    )
  )
    return 'River map graph lists are missing or too large';
  const nodes = map.nodes as unknown[],
    edges = map.edges as unknown[],
    corners = map.corners as unknown[];
  const width = map.width,
    height = map.height,
    tolerance = Math.max(width, height) * 1e-7;
  const mappedPoint = (value: unknown): value is Vertex =>
    point(value) &&
    value.x >= -tolerance &&
    value.y >= -tolerance &&
    value.x <= width + tolerance &&
    value.y <= height + tolerance;
  for (const [i, value] of nodes.entries()) {
    const node = record(value),
      polygon = record(node?.polygon);
    if (
      !node ||
      node.id !== i ||
      !mappedPoint(node.center) ||
      !finite(node.elevation) ||
      !finite(node.moisture) ||
      !finite(node.temperature) ||
      typeof node.isWater !== 'boolean' ||
      typeof node.isOcean !== 'boolean' ||
      typeof node.isCoast !== 'boolean' ||
      !ids(node.edges, edges.length) ||
      !ids(node.corners, corners.length) ||
      !ids(node.neighbors, nodes.length) ||
      !polygon ||
      !Array.isArray(polygon.vertices) ||
      polygon.vertices.length < 3 ||
      polygon.vertices.length > Math.min(corners.length, RIVER_LIMITS.samples) ||
      !polygon.vertices.every(mappedPoint)
    )
      return `Invalid river map node ${i}`;
  }
  for (const [i, value] of corners.entries()) {
    const corner = record(value);
    if (
      !corner ||
      corner.id !== i ||
      !mappedPoint(corner.point) ||
      !finite(corner.elevation) ||
      !finite(corner.moisture) ||
      !finite(corner.temperature) ||
      !finite(corner.river) ||
      !Number.isSafeInteger(corner.river) ||
      corner.river < 0 ||
      typeof corner.isWater !== 'boolean' ||
      typeof corner.isOcean !== 'boolean' ||
      typeof corner.isCoast !== 'boolean' ||
      !ids(corner.touches, nodes.length) ||
      !ids(corner.adjacent, corners.length) ||
      !ids(corner.protrudes, edges.length) ||
      (corner.downslope !== undefined &&
        (!Number.isInteger(corner.downslope) ||
          !corner.adjacent.includes(corner.downslope as number)))
    )
      return `Invalid river map corner ${i}`;
  }
  for (const [i, value] of edges.entries()) {
    const edge = record(value);
    if (
      !edge ||
      edge.id !== i ||
      !ids([edge.v0, edge.v1], corners.length) ||
      !ids(edge.d1 === undefined ? [edge.d0] : [edge.d0, edge.d1], nodes.length) ||
      !finite(edge.river) ||
      !Number.isSafeInteger(edge.river) ||
      edge.river < 0 ||
      !mappedPoint(edge.midpoint)
    )
      return `Invalid river map edge ${i}`;
  }
  const typed = value as RegionMap;
  for (const edge of typed.edges) {
    if (
      ![edge.v0, edge.v1].every(
        (id) =>
          typed.corners[id].protrudes.includes(edge.id) &&
          typed.corners[id].adjacent.includes(id === edge.v0 ? edge.v1 : edge.v0),
      ) ||
      ![edge.d0, ...(edge.d1 === undefined ? [] : [edge.d1])].every(
        (id) =>
          typed.nodes[id].edges.includes(edge.id) &&
          typed.nodes[id].corners.includes(edge.v0) &&
          typed.nodes[id].corners.includes(edge.v1),
      )
    )
      return `Inconsistent river map edge ${edge.id}`;
  }
  for (const node of typed.nodes) {
    if (
      node.corners.some((id) => !typed.corners[id].touches.includes(node.id)) ||
      node.edges.some((id) => typed.edges[id].d0 !== node.id && typed.edges[id].d1 !== node.id) ||
      node.neighbors.some((id) => !typed.nodes[id].neighbors.includes(node.id))
    )
      return `Inconsistent river map node ${node.id}`;
  }
  for (const corner of typed.corners) {
    if (
      corner.touches.some((id) => !typed.nodes[id].corners.includes(corner.id)) ||
      corner.protrudes.some(
        (id) => typed.edges[id].v0 !== corner.id && typed.edges[id].v1 !== corner.id,
      )
    )
      return `Inconsistent river map corner ${corner.id}`;
  }
  return null;
}

/** Shared by candidate generation and saved-data validation. */
export function riverReachGeometryError(
  map: RegionMap,
  reach: RiverChannelReach,
  network: RiverNetwork,
): string | null {
  const junctions = new Map(network.junctions.map((junction) => [junction.id, junction]));
  const from = junctions.get(reach.fromJunctionId)!,
    to = junctions.get(reach.toJunctionId)!;
  const tolerance = riverTolerance(map);
  const near = (p: Vertex, q: Vertex, radius: number) =>
    Math.hypot(p.x - q.x, p.y - q.y) <= radius + tolerance;
  const start = reach.samples[0],
    end = reach.samples.at(-1)!;
  if (!near(start.point, from.point, tolerance) || !near(end.point, to.point, tolerance))
    return 'Channel endpoints do not match junctions';
  if (from.role.kind === 'source' ? start.waterWidth !== 0 : start.waterWidth <= 0)
    return 'Invalid source taper or pinched join';
  let lastElevation = Infinity;
  for (const [i, sample] of reach.samples.entries()) {
    if (
      sample.waterWidth < 0 ||
      (sample.waterWidth === 0 && (i !== 0 || from.role.kind !== 'source'))
    )
      return 'Invalid channel width';
    if (i > 0 && near(sample.point, reach.samples[i - 1].point, 0))
      return 'Coincident channel samples';
    const elevation = riverTerrainElevation(map, reach.corridorNodeIds, sample.point);
    if (elevation === null || elevation > lastElevation + 1e-6)
      return 'Channel leaves its corridor or flows uphill';
    lastElevation = elevation;
    if (
      sample.point.x < -tolerance ||
      sample.point.y < -tolerance ||
      sample.point.x > map.width + tolerance ||
      sample.point.y > map.height + tolerance
    )
      return 'Channel leaves map';
  }
  const envelope = riverEnvelope(reach);
  if (!simpleRiverPolygon(envelope)) return 'Channel envelope is not simple';
  const startRadius = start.waterWidth * 1.5,
    endRadius = end.waterWidth * 1.5;
  for (const p of envelope) {
    // Junction caps can extend into incident cells; outlets are clipped against drawn water.
    if (near(p, from.point, startRadius) || near(p, to.point, endRadius)) continue;
    // Clipping/vertex interning can leave a sub-tolerance sliver beside a one-sided sheet edge.
    // Its outer bank belongs to the cropped margin, rather than an unrelated terrain corridor.
    if (reach.kind === 'ordinary' && map.edges[reach.drainageEdgeId].d1 === undefined) continue;
    const clipped = {
      x: Math.max(0, Math.min(map.width, p.x)),
      y: Math.max(0, Math.min(map.height, p.y)),
    };
    if (
      !reach.corridorNodeIds.some(
        (id) =>
          !map.nodes[id].isWater &&
          pointInRiverPolygon(clipped, map.nodes[id].polygon.vertices, tolerance),
      )
    )
      return 'Channel banks leave land corridor';
  }
  // Verify segments too: a narrow crossed cell must not disappear between samples.
  for (let i = 1; i < reach.samples.length; i++) {
    const a = reach.samples[i - 1].point,
      b = reach.samples[i].point;
    for (const node of map.nodes) {
      if (!node.isWater) continue;
      for (let j = 0; j < node.polygon.vertices.length; j++) {
        const p = riverSegmentIntersection(
          a,
          b,
          node.polygon.vertices[j],
          node.polygon.vertices[(j + 1) % node.polygon.vertices.length],
        );
        if (p && !(to.role.kind === 'outlet' && near(p, to.point, endRadius)))
          return 'Channel crosses unrelated water';
      }
    }
  }
  if (network.origin === 'generated') {
    const roads = buildRoadCentroidPolylines(map);
    const edge = map.edges[reach.drainageEdgeId];
    const a = map.corners[edge.v0].point,
      b = map.corners[edge.v1].point;
    for (const road of roads)
      for (let i = 1; i < road.length; i++) {
        const fixed = riverSegmentIntersection(a, b, road[i - 1], road[i]);
        if (
          reach.kind === 'ordinary' &&
          fixed &&
          !reach.samples
            .slice(1)
            .some(
              (sample, j) =>
                distancePointToSegmentSquared(fixed, reach.samples[j].point, sample.point) <=
                tolerance ** 2,
            )
        )
          return 'Channel moved away from its road crossing';
        if (
          reach.kind === 'distributary' &&
          reach.samples
            .slice(1)
            .some((sample, j) =>
              riverSegmentIntersection(reach.samples[j].point, sample.point, road[i - 1], road[i]),
            )
        )
          return 'Distributary crosses an existing road';
      }
  }
  return null;
}

/** Return an actionable error, without dereferencing malformed imported data. */
export function riverNetworkError(mapValue: unknown, networkValue: unknown): string | null {
  const graphError = riverGraphError(mapValue);
  if (graphError) return graphError;
  const map = mapValue as RegionMap,
    network = record(networkValue);
  if (
    !network ||
    network.version !== 1 ||
    !['generated', 'legacy'].includes(String(network.origin))
  )
    return 'Unsupported river network version or origin';
  const reachLimit = map.edges.filter((edge) => edge.river > 0).length * 4;
  if (
    !Array.isArray(network.reaches) ||
    network.reaches.length > reachLimit ||
    !Array.isArray(network.junctions) ||
    network.junctions.length > reachLimit * 2 ||
    !Array.isArray(network.islands) ||
    network.islands.length > reachLimit * RIVER_LIMITS.islandsPerReach ||
    !Array.isArray(network.deltas) ||
    network.deltas.length > map.edges.length
  )
    return 'Missing or excessive river network lists';
  for (const value of network.junctions) {
    const j = record(value),
      location = record(j?.location),
      role = record(j?.role);
    if (
      !j ||
      typeof j.id !== 'string' ||
      !j.id ||
      !point(j.point) ||
      !finite(j.localSupply) ||
      !Number.isSafeInteger(j.localSupply) ||
      j.localSupply < 0 ||
      !location ||
      !role ||
      !['source', 'continuation', 'confluence', 'split', 'outlet'].includes(String(role.kind))
    )
      return 'Invalid river junction';
    if (location.kind === 'corner') {
      if (
        !ids([location.cornerId], map.corners.length) ||
        Math.hypot(
          j.point.x - map.corners[location.cornerId as number].point.x,
          j.point.y - map.corners[location.cornerId as number].point.y,
        ) > riverTolerance(map)
      )
        return `Invalid corner binding ${j.id}`;
    } else if (
      location.kind !== 'surface' ||
      !ids([location.nodeId], map.nodes.length) ||
      !pointInRiverPolygon(
        j.point,
        map.nodes[location.nodeId as number].polygon.vertices,
        riverTolerance(map),
      )
    )
      return `Invalid surface binding ${j.id}`;
    if (
      role.kind !== 'outlet' &&
      (location.kind === 'corner'
        ? map.corners[location.cornerId as number].touches.some((id) => map.nodes[id].isWater)
        : map.nodes[location.nodeId as number].isWater)
    )
      return `Submerged inland river junction ${j.id}`;
    if (role.kind === 'outlet') {
      const target = record(role.target);
      if (j.localSupply !== 0 || !target) return `Invalid river outlet ${j.id}`;
      if (target.kind === 'boundary') {
        const coordinate =
          target.side === 'north'
            ? j.point.y
            : target.side === 'east'
              ? j.point.x - map.width
              : target.side === 'south'
                ? j.point.y - map.height
                : target.side === 'west'
                  ? j.point.x
                  : Infinity;
        if (Math.abs(coordinate) > riverTolerance(map)) return `Invalid boundary outlet ${j.id}`;
      } else {
        if (
          !['ocean', 'lake'].includes(String(target.kind)) ||
          !ids([target.nodeId], map.nodes.length)
        )
          return `Invalid water outlet ${j.id}`;
        const node = map.nodes[target.nodeId as number];
        if (
          !node.isWater ||
          node.isOcean !== (target.kind === 'ocean') ||
          !node.polygon.vertices.some(
            (a, i) =>
              distancePointToSegmentSquared(
                j.point as Vertex,
                a,
                node.polygon.vertices[(i + 1) % node.polygon.vertices.length],
              ) <=
              riverTolerance(map) ** 2,
          )
        )
          return `Unmapped water outlet ${j.id}`;
      }
    }
  }
  for (const value of network.reaches) {
    const r = record(value);
    if (
      !r ||
      typeof r.id !== 'string' ||
      !r.id ||
      typeof r.fromJunctionId !== 'string' ||
      typeof r.toJunctionId !== 'string' ||
      !ids([r.drainageEdgeId], map.edges.length) ||
      !['ordinary', 'deltaConnector', 'distributary'].includes(String(r.kind)) ||
      !finite(r.flow) ||
      r.flow <= 0 ||
      (r.kind !== 'distributary' && !Number.isSafeInteger(r.flow)) ||
      r.sizeClass !== riverSizeClass(r.flow) ||
      !ids(r.corridorNodeIds, map.nodes.length) ||
      r.corridorNodeIds.length === 0 ||
      !Array.isArray(r.samples) ||
      r.samples.length < 2 ||
      r.samples.length > RIVER_LIMITS.samples ||
      !r.samples.every((value) => {
        const s = record(value);
        return (
          s !== null &&
          point(s.point) &&
          finite(s.waterWidth) &&
          s.waterWidth <= Math.min(map.width, map.height) / 4
        );
      })
    )
      return 'Invalid river reach';
  }
  for (const value of network.islands) {
    const island = record(value);
    if (
      !island ||
      typeof island.id !== 'string' ||
      !island.id ||
      typeof island.reachId !== 'string' ||
      !Array.isArray(island.outline) ||
      island.outline.length < 3 ||
      island.outline.length > RIVER_LIMITS.islandVertices ||
      !island.outline.every(point)
    )
      return 'Invalid river island';
  }
  for (const value of network.deltas) {
    const delta = record(value);
    if (
      !delta ||
      typeof delta.id !== 'string' ||
      !delta.id ||
      !ids([delta.drainageEdgeId], map.edges.length) ||
      typeof delta.splitJunctionId !== 'string' ||
      !Array.isArray(delta.branchReachIds) ||
      delta.branchReachIds.length < 2 ||
      delta.branchReachIds.length > RIVER_LIMITS.branches ||
      !delta.branchReachIds.every((id) => typeof id === 'string') ||
      new Set(delta.branchReachIds).size !== delta.branchReachIds.length
    )
      return 'Invalid river delta';
  }
  const typed = networkValue as RiverNetwork;
  if (
    typed.reaches.reduce((sum, reach) => sum + reach.samples.length, 0) > RIVER_LIMITS.totalSamples
  )
    return 'Excessive river samples';
  const allIds = [...typed.junctions, ...typed.reaches, ...typed.islands, ...typed.deltas].map(
    (entry) => entry.id,
  );
  if (new Set(allIds).size !== allIds.length) return 'Duplicate river identity';
  const junctions = new Map(typed.junctions.map((j) => [j.id, j]));
  const reaches = new Map(typed.reaches.map((r) => [r.id, r]));
  const incoming = new Map(typed.junctions.map((j) => [j.id, [] as RiverChannelReach[]]));
  const outgoing = new Map(typed.junctions.map((j) => [j.id, [] as RiverChannelReach[]]));
  for (const reach of typed.reaches) {
    if (
      !junctions.has(reach.fromJunctionId) ||
      !junctions.has(reach.toJunctionId) ||
      reach.fromJunctionId === reach.toJunctionId
    )
      return `Dangling river reach ${reach.id}`;
    incoming.get(reach.toJunctionId)!.push(reach);
    outgoing.get(reach.fromJunctionId)!.push(reach);
    const error = riverReachGeometryError(map, reach, typed);
    if (error) return `${reach.id}: ${error}`;
  }
  for (const j of typed.junctions) {
    const ins = incoming.get(j.id)!,
      outs = outgoing.get(j.id)!;
    const degreeOK =
      j.role.kind === 'source'
        ? ins.length === 0 && outs.length === 1 && j.localSupply > 0
        : j.role.kind === 'continuation'
          ? ins.length === 1 && outs.length === 1
          : j.role.kind === 'confluence'
            ? ins.length >= 2 && outs.length === 1
            : j.role.kind === 'split'
              ? ins.length === 1 &&
                outs.length >= 2 &&
                outs.length <= RIVER_LIMITS.branches &&
                j.localSupply === 0
              : ins.length >= 1 && outs.length === 0;
    if (!degreeOK) return `Invalid river degree ${j.id}`;
    if (j.role.kind === 'continuation' || j.role.kind === 'confluence') {
      const width = outs[0].samples[0].waterWidth;
      if (ins.some((r) => r.samples.at(-1)!.waterWidth > width + riverTolerance(map)))
        return `River junction pinches at ${j.id}`;
    }
    const supply = ins.reduce((sum, r) => sum + r.flow, j.localSupply);
    if (
      j.role.kind !== 'outlet' &&
      Math.abs(supply - outs.reduce((sum, r) => sum + r.flow, 0)) > 1e-9 * Math.max(1, supply)
    )
      return `River flow is not conserved at ${j.id}`;
  }
  const degrees = new Map(typed.junctions.map((j) => [j.id, incoming.get(j.id)!.length]));
  const queue = typed.junctions.filter((j) => degrees.get(j.id) === 0).map((j) => j.id);
  for (let i = 0; i < queue.length; i++)
    for (const r of outgoing.get(queue[i])!) {
      degrees.set(r.toJunctionId, degrees.get(r.toJunctionId)! - 1);
      if (degrees.get(r.toJunctionId) === 0) queue.push(r.toJunctionId);
    }
  if (queue.length !== typed.junctions.length) return 'River network contains a cycle';
  const deltaEdges = new Set<number>(),
    branchIds = new Set<string>(),
    splitIds = new Set<string>();
  for (const delta of typed.deltas) {
    const split = junctions.get(delta.splitJunctionId);
    if (
      !split ||
      split.role.kind !== 'split' ||
      splitIds.has(split.id) ||
      deltaEdges.has(delta.drainageEdgeId)
    )
      return `Invalid delta split ${delta.id}`;
    splitIds.add(split.id);
    deltaEdges.add(delta.drainageEdgeId);
    const contacts: Vertex[] = [];
    for (const id of delta.branchReachIds) {
      const r = reaches.get(id),
        outlet = r && junctions.get(r.toJunctionId);
      if (
        !r ||
        branchIds.has(id) ||
        r.kind !== 'distributary' ||
        r.drainageEdgeId !== delta.drainageEdgeId ||
        r.fromJunctionId !== split.id ||
        !outlet ||
        outlet.role.kind !== 'outlet' ||
        outlet.role.target.kind !== 'ocean'
      )
        return `Invalid delta branch ${id}`;
      branchIds.add(id);
      contacts.push(outlet.point);
    }
    if (
      delta.branchReachIds.reduce((sum, id) => sum + reaches.get(id)!.flow, 0) >
      map.edges[delta.drainageEdgeId].river + 1e-9
    )
      return `Delta exceeds its drainage supply ${delta.id}`;
    if (
      outgoing.get(split.id)!.length !== delta.branchReachIds.length ||
      contacts.some((p, i) =>
        contacts.slice(i + 1).some((q) => Math.hypot(p.x - q.x, p.y - q.y) <= riverTolerance(map)),
      )
    )
      return `Duplicate delta contacts ${delta.id}`;
  }
  const ordinaryEdges = new Set<number>();
  for (const r of typed.reaches) {
    const edge = map.edges[r.drainageEdgeId],
      from = junctions.get(r.fromJunctionId)!,
      to = junctions.get(r.toJunctionId)!;
    if (r.flow > edge.river + 1e-9 || edge.river <= 0) return `Invalid drainage flow ${r.id}`;
    if (r.kind === 'distributary' && !branchIds.has(r.id)) return `Unowned distributary ${r.id}`;
    if (
      r.kind === 'deltaConnector' &&
      (!deltaEdges.has(edge.id) ||
        to.role.kind !== 'split' ||
        from.location.kind !== 'corner' ||
        ![edge.v0, edge.v1].includes(from.location.cornerId) ||
        to.location.kind !== 'surface' ||
        ![edge.d0, edge.d1].includes(to.location.nodeId))
    )
      return `Unowned delta connector ${r.id}`;
    if (r.kind === 'ordinary') {
      if (
        ordinaryEdges.has(edge.id) ||
        deltaEdges.has(edge.id) ||
        from.location.kind !== 'corner' ||
        to.location.kind !== 'corner' ||
        ![edge.v0, edge.v1].includes(from.location.cornerId) ||
        ![edge.v0, edge.v1].includes(to.location.cornerId) ||
        map.corners[from.location.cornerId].downslope !== to.location.cornerId
      )
        return `Invalid drainage attribution ${r.id}`;
      ordinaryEdges.add(edge.id);
    }
  }
  if (typed.junctions.some((j) => j.role.kind === 'split' && !splitIds.has(j.id)))
    return 'Unowned delta split';
  const roads = buildRoadCentroidPolylines(map);
  for (const island of typed.islands) {
    const reach = reaches.get(island.reachId);
    if (
      !reach ||
      reach.sizeClass !== 'broad' ||
      reach.kind !== 'ordinary' ||
      !simpleRiverPolygon(island.outline) ||
      riverPolygonArea(island.outline) <= riverTolerance(map) ** 2 ||
      typed.islands.filter((i) => i.reachId === reach.id).length > RIVER_LIMITS.islandsPerReach
    )
      return `Invalid island ownership/shape ${island.id}`;
    const envelope = riverEnvelope(reach),
      clearance = Math.min(...reach.samples.slice(1).map((s) => s.waterWidth)) * 0.1;
    for (const p of island.outline) {
      if (
        !pointInRiverPolygon(p, envelope) ||
        envelope.some(
          (a, i) =>
            distancePointToSegmentSquared(p, a, envelope[(i + 1) % envelope.length]) <
            clearance ** 2,
        )
      )
        return `Island has no surrounding channel ${island.id}`;
      const exclusion = Math.max(...reach.samples.map((sample) => sample.waterWidth)) * 2;
      if (
        [reach.samples[0].point, reach.samples.at(-1)!.point].some(
          (q) => Math.hypot(p.x - q.x, p.y - q.y) < exclusion,
        ) ||
        minDistanceSquaredToRoadPolylines(roads, p.x, p.y) < exclusion ** 2
      )
        return `Island occupies a junction or road crossing ${island.id}`;
    }
    if (
      island.outline.some((p, i) =>
        envelope.some((q, j) =>
          riverSegmentIntersection(
            p,
            island.outline[(i + 1) % island.outline.length],
            q,
            envelope[(j + 1) % envelope.length],
          ),
        ),
      )
    )
      return `Island leaves its channel ${island.id}`;
    for (const other of typed.islands)
      if (island.id < other.id && riverPolygonsOverlap(island.outline, other.outline))
        return `Overlapping river islands ${island.id}`;
  }
  return riverNetworkIntersectionError(typed);
}

/** Spatial bins bound comparisons to neighboring channel segments rather than the whole map. */
export function riverNetworkIntersectionError(network: RiverNetwork): string | null {
  type Segment = { a: Vertex; b: Vertex; reach: RiverChannelReach; width: number };
  const bins = new Map<string, Segment[]>();
  const binSize = Math.max(
    1,
    ...network.junctions.map((j) => Math.max(Math.abs(j.point.x), Math.abs(j.point.y)) / 64),
  );
  const junctions = new Map(network.junctions.map((j) => [j.id, j.point]));
  for (const reach of network.reaches)
    for (let i = 1; i < reach.samples.length; i++) {
      const a = reach.samples[i - 1].point,
        b = reach.samples[i].point;
      const width = Math.max(reach.samples[i - 1].waterWidth, reach.samples[i].waterWidth);
      const keys: string[] = [];
      for (
        let x = Math.floor((Math.min(a.x, b.x) - width) / binSize);
        x <= Math.floor((Math.max(a.x, b.x) + width) / binSize);
        x++
      )
        for (
          let y = Math.floor((Math.min(a.y, b.y) - width) / binSize);
          y <= Math.floor((Math.max(a.y, b.y) + width) / binSize);
          y++
        )
          keys.push(`${x}:${y}`);
      const compared = new Set<Segment>();
      for (const key of keys)
        for (const other of bins.get(key) ?? []) {
          if (other.reach.id === reach.id || compared.has(other)) continue;
          compared.add(other);
          const shared = [reach.fromJunctionId, reach.toJunctionId]
            .filter((id) => other.reach.fromJunctionId === id || other.reach.toJunctionId === id)
            .map((id) => junctions.get(id)!);
          const radius = (width + other.width) * 2;
          const crossing = riverSegmentIntersection(a, b, other.a, other.b);
          const pairs = [
            [a, closestRiverPoint(a, other.a, other.b)],
            [b, closestRiverPoint(b, other.a, other.b)],
            [closestRiverPoint(other.a, a, b), other.a],
            [closestRiverPoint(other.b, a, b), other.b],
          ];
          pairs.sort(
            (x, y) =>
              Math.hypot(x[0].x - x[1].x, x[0].y - x[1].y) -
              Math.hypot(y[0].x - y[1].x, y[0].y - y[1].y),
          );
          const contact = crossing ? [crossing, crossing] : pairs[0];
          if (shared.some((p) => contact.every((q) => Math.hypot(p.x - q.x, p.y - q.y) <= radius)))
            continue;
          const distance = Math.min(
            distancePointToSegmentSquared(a, other.a, other.b),
            distancePointToSegmentSquared(b, other.a, other.b),
            distancePointToSegmentSquared(other.a, a, b),
            distancePointToSegmentSquared(other.b, a, b),
          );
          if (crossing || distance < ((width + other.width) / 2) ** 2)
            return `Unrelated river channels overlap: ${reach.id}, ${other.reach.id}`;
        }
      const segment = { a, b, reach, width };
      for (const key of keys) {
        const list = bins.get(key) ?? [];
        list.push(segment);
        bins.set(key, list);
      }
    }
  return null;
}
