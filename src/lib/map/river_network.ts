import type { Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import { atMapEdge, connectedRiverReaches, riverChannelWidth } from './river_paths';
import type {
  RiverChannelReach,
  RiverJunction,
  RiverNetwork,
  RiverOutletTarget,
  RiverSizeClass,
} from './river_network_types';

export function riverSizeClass(flow: number): RiverSizeClass {
  return flow < 3 ? 'stream' : flow < 8 ? 'channel' : 'broad';
}

export function riverOutletTarget(map: RegionMap, cornerId: number): RiverOutletTarget | null {
  const corner = map.corners[cornerId];
  const water = corner.touches.map((id) => map.nodes[id]).find((node) => node.isWater);
  if (water) return { kind: water.isOcean ? 'ocean' : 'lake', nodeId: water.id };
  if (!atMapEdge(corner.point, map)) return null;
  const { x, y } = corner.point;
  return {
    kind: 'boundary',
    side: y === 0 ? 'north' : x === map.width ? 'east' : y === map.height ? 'south' : 'west',
  };
}

/** Final-water reconciliation retains only contributions from recorded, still-dry springs. */
export function buildRiverNetwork(
  map: RegionMap,
  springs?: ReadonlyMap<number, number>,
): RiverNetwork {
  const outlets = new Set(
    map.corners.filter((corner) => riverOutletTarget(map, corner.id)).map((corner) => corner.id),
  );
  const retained = connectedRiverReaches(map, outlets).filter(
    (reach) => !map.corners[reach.from].isWater,
  );
  const directed = new Map(retained.map((reach) => [reach.from, reach]));
  const flows = new Map<number, number>(),
    supplies = new Map<number, number>();
  if (springs) {
    for (const [source, supply] of springs) {
      if (!directed.has(source)) continue;
      supplies.set(source, supply);
      let at = source;
      const visited = new Set<number>();
      while (directed.has(at) && !visited.has(at)) {
        visited.add(at);
        const reach = directed.get(at)!;
        flows.set(reach.edge.id, (flows.get(reach.edge.id) ?? 0) + supply);
        at = reach.to;
        if (map.corners[at].isWater) break;
      }
    }
  } else {
    for (const reach of retained) flows.set(reach.edge.id, reach.edge.river);
  }
  const active = retained.filter((reach) => (flows.get(reach.edge.id) ?? 0) > 0);
  const incoming = new Map<number, number>(),
    outgoing = new Map<number, number>();
  const inDegree = new Map<number, number>();
  for (const reach of active) {
    const flow = flows.get(reach.edge.id)!;
    incoming.set(reach.to, (incoming.get(reach.to) ?? 0) + flow);
    inDegree.set(reach.to, (inDegree.get(reach.to) ?? 0) + 1);
    outgoing.set(reach.from, flow);
  }
  const cornerIds = [...new Set(active.flatMap((reach) => [reach.from, reach.to]))].sort(
    (a, b) => a - b,
  );
  const junctions: RiverJunction[] = cornerIds.map((id) => {
    const target = outgoing.has(id) ? null : riverOutletTarget(map, id);
    const supply = springs
      ? (supplies.get(id) ?? 0)
      : target
        ? 0
        : (outgoing.get(id) ?? 0) - (incoming.get(id) ?? 0);
    if (supply < 0 || (!outgoing.has(id) && !target))
      throw new Error(`Invalid river supply/outlet at corner ${id}`);
    return {
      id: `river-corner:${id}`,
      point: { ...map.corners[id].point },
      localSupply: supply,
      location: { kind: 'corner', cornerId: id },
      role: target
        ? { kind: 'outlet', target }
        : {
            kind: !incoming.has(id)
              ? 'source'
              : (inDegree.get(id) ?? 0) > 1
                ? 'confluence'
                : 'continuation',
          },
    };
  });
  const scale = Math.min(map.width, map.height) / 35;
  const reaches: RiverChannelReach[] = active.map((reach) => {
    const flow = flows.get(reach.edge.id)!;
    const from = map.corners[reach.from],
      to = map.corners[reach.to];
    const start = incoming.has(from.id) ? riverChannelWidth(flow, scale) : 0;
    const end = riverChannelWidth(Math.max(flow, outgoing.get(to.id) ?? 0), scale);
    return {
      id: `river-edge:${reach.edge.id}`,
      fromJunctionId: `river-corner:${from.id}`,
      toJunctionId: `river-corner:${to.id}`,
      drainageEdgeId: reach.edge.id,
      kind: 'ordinary',
      flow,
      sizeClass: riverSizeClass(flow),
      corridorNodeIds: [...new Set([...from.touches, ...to.touches])].sort((a, b) => a - b),
      samples: [
        { point: { ...from.point }, waterWidth: start },
        { point: { ...to.point }, waterWidth: end },
      ],
    };
  });
  return {
    version: 1,
    origin: springs ? 'generated' : 'legacy',
    junctions,
    reaches,
    islands: [],
    deltas: [],
  };
}

/** Shared linear width/taper semantics, independent of sampling density. */
export function setRiverSamples(
  reach: RiverChannelReach,
  points: Vertex[],
  source: boolean,
  scale: number,
): void {
  const distances = [0];
  for (let i = 1; i < points.length; i++)
    distances.push(
      distances[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y),
    );
  const length = distances.at(-1)!;
  const start = riverChannelWidth(reach.flow, scale),
    end = reach.samples.at(-1)!.waterWidth;
  reach.samples = points.map((point, i) => ({
    point,
    waterWidth:
      (start + ((end - start) * distances[i]) / length) *
      (source ? Math.min(1, distances[i] / Math.min(length, 1.2 * scale)) : 1),
  }));
}
