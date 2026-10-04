import type { RNG } from '@ironarachne/rng';
import type { Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import { sampleRiverCurve, subdivideRiverChordJittered } from './river_paths';
import { buildRoadCentroidPolylines, minDistanceSquaredToRoadPolylines } from './road_polylines';
import { buildRiverNetwork, riverSizeClass, setRiverSamples } from './river_network';
import {
  pointInRiverPolygon,
  riverSegmentIntersection,
  riverTerrainElevation,
} from './river_geometry';
import {
  riverNetworkError,
  riverNetworkIntersectionError,
  riverReachGeometryError,
} from './river_validation';
import {
  RIVER_LIMITS,
  type RiverChannelReach,
  type RiverJunction,
  type RiverNetwork,
} from './river_network_types';

const DELTA_MIN_FLOW = 8;
const DELTA_CHANCE = 0.35;
const ISLAND_CHANCE = 0.4;

function lerp(a: Vertex, b: Vertex, t: number): Vertex {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Curves are cubic pieces joined at fixed drainage corners and actual road crossings. */
function curvedPoints(
  map: RegionMap,
  network: RiverNetwork,
  reach: RiverChannelReach,
  bend: number,
): Vertex[] {
  const junctions = new Map(network.junctions.map((j) => [j.id, j]));
  const from = junctions.get(reach.fromJunctionId)!,
    to = junctions.get(reach.toJunctionId)!;
  const a = from.point,
    b = to.point;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy);
  const tangent = (junction: RiverJunction): Vertex => {
    const next = network.reaches.find((r) => r.fromJunctionId === junction.id);
    const previous = network.reaches
      .filter((r) => r.toJunctionId === junction.id)
      .sort((x, y) => y.flow - x.flow || x.id.localeCompare(y.id))[0];
    const upstream = previous ? junctions.get(previous.fromJunctionId)!.point : a;
    const downstream = next ? junctions.get(next.toJunctionId)!.point : b;
    const distance = Math.hypot(downstream.x - upstream.x, downstream.y - upstream.y) || 1;
    return { x: (downstream.x - upstream.x) / distance, y: (downstream.y - upstream.y) / distance };
  };
  const ta = tangent(from),
    tb = tangent(to);
  const anchors = [
    { t: 0, point: a },
    { t: 1, point: b },
  ];
  for (const road of buildRoadCentroidPolylines(map))
    for (let i = 1; i < road.length; i++) {
      const cross = riverSegmentIntersection(a, b, road[i - 1], road[i]);
      if (cross)
        anchors.push({ t: Math.hypot(cross.x - a.x, cross.y - a.y) / length, point: cross });
    }
  anchors.sort((x, y) => x.t - y.t);
  const points: Vertex[] = [];
  for (let piece = 1; piece < anchors.length; piece++) {
    const start = anchors[piece - 1],
      end = anchors[piece];
    if (end.t - start.t < 1e-8) continue;
    const steps = Math.max(4, Math.min(24, Math.ceil((length * (end.t - start.t)) / 0.12)));
    const pieceLength = length * (end.t - start.t);
    // Tangents are blended toward the chord as feasibility demands less curvature.
    const strength = Math.min(1, Math.abs(bend) / 0.06);
    const chord = { x: dx / length, y: dy / length };
    const startTangent = piece === 1 ? ta : chord,
      endTangent = piece === anchors.length - 1 ? tb : chord;
    const c1 = {
      x: start.point.x + ((chord.x + (startTangent.x - chord.x) * strength) * pieceLength) / 3,
      y: start.point.y + ((chord.y + (startTangent.y - chord.y) * strength) * pieceLength) / 3,
    };
    const c2 = {
      x: end.point.x - ((chord.x + (endTangent.x - chord.x) * strength) * pieceLength) / 3,
      y: end.point.y - ((chord.y + (endTangent.y - chord.y) * strength) * pieceLength) / 3,
    };
    for (let i = 0; i < steps; i++) {
      const t = i / steps,
        u = 1 - t;
      const offset = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI) ** 2 * bend * pieceLength;
      points.push({
        x:
          u ** 3 * start.point.x +
          3 * u ** 2 * t * c1.x +
          3 * u * t ** 2 * c2.x +
          t ** 3 * end.point.x -
          (dy / length) * offset,
        y:
          u ** 3 * start.point.y +
          3 * u ** 2 * t * c1.y +
          3 * u * t ** 2 * c2.y +
          t ** 3 * end.point.y +
          (dx / length) * offset,
      });
    }
  }
  points.push(b);
  // Road crossings are never removed by a sampling cap. An unusually dense road mesh stays straight.
  return points.length <= RIVER_LIMITS.samples ? points : [a, b];
}

function shapeOrdinaryChannels(map: RegionMap, network: RiverNetwork, rng: RNG): void {
  const scale = Math.min(map.width, map.height) / 35;
  for (const reach of network.reaches) {
    const edge = map.edges[reach.drainageEdgeId];
    const from = network.junctions.find((j) => j.id === reach.fromJunctionId)!;
    const to = network.junctions.find((j) => j.id === reach.toJunctionId)!;
    const length = Math.hypot(to.point.x - from.point.x, to.point.y - from.point.y);
    const slope =
      Math.abs(map.corners[edge.v0].elevation - map.corners[edge.v1].elevation) / length;
    const relief =
      Math.max(...reach.corridorNodeIds.map((id) => map.nodes[id].elevation)) -
      Math.min(...reach.corridorNodeIds.map((id) => map.nodes[id].elevation));
    const bend = ((rng.int(-1000, 1000) / 1000) * 0.14) / (1 + slope * 18 + relief * 6);
    const original = structuredClone(reach.samples);
    let error: string | null = null;
    for (let attempt = 0; attempt < RIVER_LIMITS.attempts; attempt++) {
      reach.samples = original;
      const amount = attempt === RIVER_LIMITS.attempts - 1 ? 0 : bend / 2 ** attempt;
      setRiverSamples(
        reach,
        curvedPoints(map, network, reach, amount),
        from.role.kind === 'source',
        scale,
      );
      error = riverReachGeometryError(map, reach, network);
      if (!error) break;
    }
    // Calibration is a preferred width, not permission to occupy a neighboring lake or sliver cell.
    for (let attempt = 0; error && attempt < RIVER_LIMITS.attempts; attempt++) {
      for (const sample of reach.samples) sample.waterWidth *= 0.6;
      error = riverReachGeometryError(map, reach, network);
    }
    if (error) throw new Error(`${reach.id}: ${error}`);
  }
  // Neighboring bends can otherwise collide in very small terrain cells. Revert only those bends.
  for (let attempt = 0; attempt < RIVER_LIMITS.attempts * 2; attempt++) {
    const error = riverNetworkIntersectionError(network);
    if (!error) {
      fitRiverJoinWidths(network);
      return;
    }
    const ids = error
      .slice(error.indexOf(':') + 1)
      .trim()
      .split(', ');
    for (const id of ids) {
      const reach = network.reaches.find((r) => r.id === id)!;
      if (attempt >= RIVER_LIMITS.attempts) {
        // Fit narrow physical corridors without changing water contributions.
        const nearby = new Set([reach.fromJunctionId, reach.toJunctionId]);
        for (const r of network.reaches)
          if (nearby.has(r.fromJunctionId) || nearby.has(r.toJunctionId))
            for (const sample of r.samples) sample.waterWidth *= 0.6;
        continue;
      }
      const from = network.junctions.find((j) => j.id === reach.fromJunctionId)!;
      setRiverSamples(
        reach,
        curvedPoints(map, network, reach, 0),
        from.role.kind === 'source',
        scale,
      );
    }
  }
  fitRiverJoinWidths(network);
}

function fitRiverJoinWidths(network: RiverNetwork): void {
  const budgets = new Map<string, number>();
  for (const reach of network.reaches)
    for (const [id, width] of [
      [reach.fromJunctionId, reach.samples[0].waterWidth],
      [reach.toJunctionId, reach.samples.at(-1)!.waterWidth],
    ] as const) {
      if (width > 0) budgets.set(id, Math.min(budgets.get(id) ?? Infinity, width));
    }
  for (const reach of network.reaches) {
    const first = reach.samples[0].waterWidth,
      last = reach.samples.at(-1)!.waterWidth;
    const startFactor = first > 0 ? budgets.get(reach.fromJunctionId)! / first : 1;
    const endFactor = budgets.get(reach.toJunctionId)! / last;
    for (const [i, sample] of reach.samples.entries())
      sample.waterWidth *=
        startFactor + ((endFactor - startFactor) * i) / (reach.samples.length - 1);
  }
}

function addDeltas(map: RegionMap, network: RiverNetwork, rng: RNG): void {
  const scale = Math.min(map.width, map.height) / 35;
  const roads = buildRoadCentroidPolylines(map);
  for (const original of [...network.reaches]) {
    const outlet = network.junctions.find((j) => j.id === original.toJunctionId)!;
    const upstream = network.junctions.find((j) => j.id === original.fromJunctionId)!;
    const edge = map.edges[original.drainageEdgeId];
    if (
      original.flow < DELTA_MIN_FLOW ||
      outlet.role.kind !== 'outlet' ||
      outlet.role.target.kind !== 'ocean' ||
      edge.d1 === undefined ||
      map.nodes[edge.d0].isWater ||
      map.nodes[edge.d1].isWater
    )
      continue;
    if (
      roads.some((road) =>
        road
          .slice(1)
          .some((p, i) => riverSegmentIntersection(upstream.point, outlet.point, road[i], p)),
      )
    )
      continue;
    const upstreamElevation = riverTerrainElevation(map, original.corridorNodeIds, upstream.point)!;
    const mouthElevation = riverTerrainElevation(map, original.corridorNodeIds, outlet.point)!;
    const length = Math.hypot(outlet.point.x - upstream.point.x, outlet.point.y - upstream.point.y);
    if (
      (upstreamElevation - mouthElevation) / length > 0.15 ||
      rng.int(0, 999) >= DELTA_CHANCE * 1000
    )
      continue;
    const splitPoint = lerp(upstream.point, outlet.point, 0.2);
    const land = original.corridorNodeIds.find(
      (id) =>
        !map.nodes[id].isWater && pointInRiverPolygon(splitPoint, map.nodes[id].polygon.vertices),
    );
    if (land === undefined) continue;
    const corridor = [
      ...new Set([
        ...original.corridorNodeIds,
        ...original.corridorNodeIds.flatMap((id) => map.nodes[id].neighbors),
      ]),
    ].sort((a, b) => a - b);
    const contacts: { point: Vertex; nodeId: number }[] = [];
    for (const coast of map.edges) {
      if (coast.d1 === undefined) continue;
      const left = map.nodes[coast.d0],
        right = map.nodes[coast.d1];
      const water =
        left.isOcean && !right.isWater ? left : right.isOcean && !left.isWater ? right : null;
      if (!water || !corridor.includes(water.id)) continue;
      const a = map.corners[coast.v0].point,
        b = map.corners[coast.v1].point;
      for (const t of [0.05, 0.1, 0.25, 0.75, 0.9, 0.95]) {
        const p = lerp(a, b, t);
        if (
          Math.hypot(p.x - outlet.point.x, p.y - outlet.point.y) <= 3 * scale &&
          Math.hypot(p.x - splitPoint.x, p.y - splitPoint.y) >
            original.samples.at(-1)!.waterWidth * 2
        )
          contacts.push({ point: p, nodeId: water.id });
      }
    }
    const direction = {
      x: outlet.point.x - upstream.point.x,
      y: outlet.point.y - upstream.point.y,
    };
    contacts.sort(
      (a, b) =>
        (a.point.x - outlet.point.x) * -direction.y +
        (a.point.y - outlet.point.y) * direction.x -
        ((b.point.x - outlet.point.x) * -direction.y + (b.point.y - outlet.point.y) * direction.x),
    );
    for (
      let attempt = 0;
      attempt < Math.min(RIVER_LIMITS.attempts, Math.floor(contacts.length / 2));
      attempt++
    ) {
      const chosen = [contacts[attempt], contacts[contacts.length - 1 - attempt]];
      const prefix = `river-delta:${edge.id}`;
      const split: RiverJunction = {
        id: `${prefix}:split`,
        point: splitPoint,
        localSupply: 0,
        location: { kind: 'surface', nodeId: land },
        role: { kind: 'split' },
      };
      const connector: RiverChannelReach = {
        ...structuredClone(original),
        id: `${prefix}:connector`,
        toJunctionId: split.id,
        kind: 'deltaConnector',
        samples: original.samples.filter(
          (sample) =>
            Math.hypot(sample.point.x - upstream.point.x, sample.point.y - upstream.point.y) <
            length * 0.2,
        ),
      };
      connector.samples.push({
        point: splitPoint,
        waterWidth: original.samples.at(-1)!.waterWidth,
      });
      if (connector.samples.length < 2) connector.samples.unshift(original.samples[0]);
      const share = 0.4 + rng.int(0, 200) / 1000;
      const branchOutlets: RiverJunction[] = chosen.map((contact, i) => ({
        id: `${prefix}:outlet:${i}`,
        point: contact.point,
        localSupply: 0,
        location: { kind: 'surface', nodeId: contact.nodeId },
        role: { kind: 'outlet', target: { kind: 'ocean', nodeId: contact.nodeId } },
      }));
      const branches: RiverChannelReach[] = chosen.map((contact, i) => {
        const flow = i === 0 ? original.flow * share : original.flow - original.flow * share;
        return {
          id: `${prefix}:branch:${i}`,
          fromJunctionId: split.id,
          toJunctionId: branchOutlets[i].id,
          drainageEdgeId: edge.id,
          kind: 'distributary',
          flow,
          sizeClass: riverSizeClass(flow),
          corridorNodeIds: corridor,
          samples: Array.from({ length: 17 }, (_, j) => ({
            point: lerp(splitPoint, contact.point, j / 16),
            waterWidth:
              original.samples.at(-1)!.waterWidth * (1 - j / 16) +
              ((0.09 + 0.09 * Math.sqrt(flow)) * scale * j) / 16,
          })),
        };
      });
      const candidate: RiverNetwork = {
        ...network,
        reaches: [...network.reaches.filter((r) => r.id !== original.id), connector, ...branches],
        junctions: [
          ...network.junctions.filter((j) => j.id !== outlet.id),
          split,
          ...branchOutlets,
        ],
        deltas: [
          ...network.deltas,
          {
            id: prefix,
            drainageEdgeId: edge.id,
            splitJunctionId: split.id,
            branchReachIds: branches.map((r) => r.id),
          },
        ],
      };
      const candidateError = riverNetworkError(map, candidate);
      if (candidateError) continue;
      Object.assign(network, candidate);
      break;
    }
  }
}

function addIslands(map: RegionMap, network: RiverNetwork, rng: RNG): void {
  const roads = buildRoadCentroidPolylines(map);
  for (const reach of network.reaches) {
    if (
      reach.kind !== 'ordinary' ||
      reach.sizeClass !== 'broad' ||
      rng.int(0, 999) >= ISLAND_CHANCE * 1000 ||
      reach.samples.length < 5
    )
      continue;
    const middle = Math.floor(reach.samples.length / 2),
      sample = reach.samples[middle];
    const before = reach.samples[middle - 1].point,
      after = reach.samples[middle + 1].point;
    const length = Math.hypot(after.x - before.x, after.y - before.y),
      dx = (after.x - before.x) / length,
      dy = (after.y - before.y) / length;
    const reachLength = Math.hypot(
      reach.samples[0].point.x - reach.samples.at(-1)!.point.x,
      reach.samples[0].point.y - reach.samples.at(-1)!.point.y,
    );
    if (
      reachLength < sample.waterWidth * 4 ||
      minDistanceSquaredToRoadPolylines(roads, sample.point.x, sample.point.y) <
        sample.waterWidth ** 2 * 4
    )
      continue;
    for (let attempt = 0; attempt < RIVER_LIMITS.attempts; attempt++) {
      const shrink = 0.8 ** attempt;
      const outline = Array.from({ length: 16 }, (_, i) => {
        const theta = (i * Math.PI) / 8;
        const along =
          Math.cos(theta) * Math.min(sample.waterWidth * 1.1, reachLength * 0.18) * shrink;
        const across = Math.sin(theta) * sample.waterWidth * 0.2 * shrink;
        return {
          x: sample.point.x + along * dx - across * dy,
          y: sample.point.y + along * dy + across * dx,
        };
      });
      const island = { id: `river-island:${reach.drainageEdgeId}:0`, reachId: reach.id, outline };
      const candidate = { ...network, islands: [...network.islands, island] };
      if (riverNetworkError(map, candidate)) continue;
      network.islands.push(island);
      break;
    }
  }
}

/** The parent owns this RNG; curves, islands and deltas cannot advance another region stage. */
export function generateRiverGeometry(map: RegionMap, rng: RNG): RegionMap {
  const result = structuredClone(map);
  const supplies = result.rivers
    ? new Map(
        result.rivers.junctions.flatMap((j) =>
          j.location.kind === 'corner' && j.localSupply > 0
            ? [[j.location.cornerId, j.localSupply] as const]
            : [],
        ),
      )
    : undefined;
  const network = buildRiverNetwork(result, supplies);
  network.origin = 'generated';
  shapeOrdinaryChannels(result, network, rng);
  addDeltas(result, network, rng);
  addIslands(result, network, rng);
  const error = riverNetworkError(result, network);
  if (error) throw new Error(error);
  result.rivers = network;
  return result;
}

/** Migration never invents islands, deltas or historically unrecorded spring identities. */
export function legacyRiverNetwork(mapValue: unknown): RiverNetwork | undefined {
  const map = mapValue as RegionMap;
  try {
    const network = buildRiverNetwork(map);
    const scale = Math.min(map.width, map.height) / 35;
    for (const reach of network.reaches) {
      const from = network.junctions.find((j) => j.id === reach.fromJunctionId)!,
        to = network.junctions.find((j) => j.id === reach.toJunctionId)!;
      const edge = map.edges[reach.drainageEdgeId];
      const salt =
        Math.min(edge.v0, edge.v1) * 49999 +
        Math.max(edge.v0, edge.v1) * 1103515245 +
        edge.id * 1009;
      setRiverSamples(
        reach,
        sampleRiverCurve(
          subdivideRiverChordJittered(from.point.x, from.point.y, to.point.x, to.point.y, salt),
        ),
        from.role.kind === 'source',
        scale,
      );
    }
    if (riverNetworkError(map, network)) return undefined;
    return network;
  } catch {
    return undefined;
  }
}
