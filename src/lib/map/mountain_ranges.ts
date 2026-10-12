import type { Vertex } from '$lib/geometry';
import type { MapNode, RegionMap } from './map_graph';
import type { MountainRangeGeometry } from './mountain_range_types';
import { classifyRegionLandforms } from './region_terrain';

const EPSILON = 1e-9;
const dry = (node: MapNode) => !node.isWater && !node.isOcean;
const distance = (a: Vertex, b: Vertex) => Math.hypot(a.x - b.x, a.y - b.y);
const cross = (a: Vertex, b: Vertex) => a.x * b.y - a.y * b.x;
const minus = (a: Vertex, b: Vertex): Vertex => ({ x: a.x - b.x, y: a.y - b.y });

export function mountainCellArea(node: MapNode): number {
  const points = node.polygon.vertices;
  return (
    Math.abs(
      points.reduce((sum, point, i) => sum + cross(point, points[(i + 1) % points.length]), 0),
    ) / 2
  );
}

/** Boundary-inclusive membership, including shared edges between cells. */
function pointInCell(point: Vertex, node: MapNode): boolean {
  const points = node.polygon.vertices;
  let inside = false;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (
      Math.abs(cross(minus(b, a), minus(point, a))) < EPSILON &&
      point.x >= Math.min(a.x, b.x) - EPSILON &&
      point.x <= Math.max(a.x, b.x) + EPSILON &&
      point.y >= Math.min(a.y, b.y) - EPSILON &&
      point.y <= Math.max(a.y, b.y) + EPSILON
    )
      return true;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y)
    )
      inside = !inside;
  }
  return inside;
}

/** Partition at every polygon crossing; midpoints prove containment of the entire segment. */
export function mountainSegmentContained(a: Vertex, b: Vertex, nodes: MapNode[]): boolean {
  const contains = (p: Vertex) => nodes.some((node) => pointInCell(p, node));
  if (!contains(a) || !contains(b)) return false;
  const direction = minus(b, a);
  const cuts = [0, 1];
  for (const node of nodes) {
    const points = node.polygon.vertices;
    for (let i = 0; i < points.length; i++) {
      const start = points[i],
        end = points[(i + 1) % points.length];
      const edge = minus(end, start),
        offset = minus(start, a);
      const denominator = cross(direction, edge);
      if (Math.abs(denominator) < EPSILON) continue;
      const t = cross(offset, edge) / denominator,
        u = cross(offset, direction) / denominator;
      if (t > 0 && t < 1 && u >= -EPSILON && u <= 1 + EPSILON) cuts.push(t);
    }
  }
  cuts.sort((x, y) => x - y);
  return cuts.slice(1).every((t, i) => {
    const mid = (t + cuts[i]) / 2;
    return contains({ x: a.x + direction.x * mid, y: a.y + direction.y * mid });
  });
}

/** Shared edges and symmetric neighbor lists must agree. IDs need not be array indexes. */
function adjacency(map: RegionMap): Map<number, number[]> {
  const nodes = new Map(map.nodes.map((node) => [node.id, node]));
  const result = new Map(map.nodes.map((node) => [node.id, new Set<number>()]));
  for (const edge of map.edges) {
    const a = nodes.get(edge.d0),
      b = edge.d1 === undefined ? undefined : nodes.get(edge.d1);
    if (!a || !b || a.id === b.id || !a.neighbors.includes(b.id) || !b.neighbors.includes(a.id))
      continue;
    if (!a.edges.includes(edge.id) || !b.edges.includes(edge.id)) continue;
    result.get(a.id)!.add(b.id);
    result.get(b.id)!.add(a.id);
  }
  return new Map([...result].map(([id, neighbors]) => [id, [...neighbors].sort((a, b) => a - b)]));
}

function components(nodes: MapNode[], links: Map<number, number[]>): MapNode[][] {
  const remaining = new Map(nodes.map((node) => [node.id, node]));
  const result: MapNode[][] = [];
  for (const node of nodes) {
    if (!remaining.delete(node.id)) continue;
    const group = [node];
    for (let i = 0; i < group.length; i++) {
      for (const id of links.get(group[i].id) ?? []) {
        const neighbor = remaining.get(id);
        if (!neighbor) continue;
        remaining.delete(id);
        group.push(neighbor);
      }
    }
    result.push(group.sort((a, b) => a.id - b.id));
  }
  return result;
}

function sweep(nodes: MapNode[], links: Map<number, number[]>, start: number) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const pending = new Set(byId.keys());
  const lengths = new Map(nodes.map((node) => [node.id, node.id === start ? 0 : Infinity]));
  const previous = new Map<number, number>();
  while (pending.size) {
    const id = [...pending].sort((a, b) => lengths.get(a)! - lengths.get(b)! || a - b)[0];
    pending.delete(id);
    for (const neighbor of links.get(id) ?? []) {
      if (!pending.has(neighbor)) continue;
      const length = lengths.get(id)! + distance(byId.get(id)!.center, byId.get(neighbor)!.center);
      const old = lengths.get(neighbor)!;
      if (
        length < old - EPSILON ||
        (Math.abs(length - old) <= EPSILON && id < (previous.get(neighbor) ?? Infinity))
      ) {
        lengths.set(neighbor, length);
        previous.set(neighbor, id);
      }
    }
  }
  const farthest = [...byId.keys()].sort((a, b) => lengths.get(b)! - lengths.get(a)! || a - b)[0];
  const path = [farthest];
  while (previous.has(path[0])) path.unshift(previous.get(path[0])!);
  return path;
}

function representativeSpine(nodes: MapNode[], links: Map<number, number[]>): number[] {
  const highest = [...nodes].sort((a, b) => b.elevation - a.elevation || a.id - b.id)[0];
  const first = sweep(nodes, links, highest.id);
  const path = sweep(nodes, links, first.at(-1)!);
  return path[0] < path.at(-1)! ? path : path.reverse();
}

export function mountainSpineLength(map: RegionMap, spineNodeIds: number[]): number {
  const nodes = new Map(map.nodes.map((node) => [node.id, node]));
  return spineNodeIds.slice(1).reduce((length, id, i) => {
    const a = nodes.get(spineNodeIds[i]),
      b = nodes.get(id);
    return a && b ? length + distance(a.center, b.center) : NaN;
  }, 0);
}

function hasFlanks(
  node: MapNode,
  before: MapNode,
  after: MapNode,
  map: Map<number, MapNode>,
  links: Map<number, number[]>,
): boolean {
  const tangent = minus(after.center, before.center);
  const sides = new Set<number>();
  for (const id of links.get(node.id) ?? []) {
    const flank = map.get(id)!;
    if (!dry(flank) || node.elevation - flank.elevation < 0.1 - EPSILON) continue;
    const side = cross(tangent, minus(flank.center, node.center));
    if (Math.abs(side) > EPSILON) sides.add(Math.sign(side));
  }
  return sides.size === 2;
}

function qualifies(
  map: RegionMap,
  geometry: MountainRangeGeometry,
  links: Map<number, number[]>,
): boolean {
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const nodes = geometry.mapNodeIds.map((id) => byId.get(id)!);
  const spine = geometry.spineNodeIds.map((id) => byId.get(id)!);
  if (spine.length < 5) return false;
  const areas = nodes.map(mountainCellArea).sort((a, b) => a - b);
  const area = areas.reduce((sum, value) => sum + value, 0);
  const length = mountainSpineLength(map, geometry.spineNodeIds);
  const median = areas[Math.max(0, Math.ceil(areas.length / 2) - 1)];
  if (length < 4 * Math.sqrt(median) - EPSILON || (length * length) / area < 2 - EPSILON)
    return false;
  if (length > 1.8 * distance(spine[0].center, spine.at(-1)!.center) + EPSILON) return false;
  const internal = spine.slice(1, -1);
  return (
    internal.filter((node, i) => hasFlanks(node, spine[i], spine[i + 2], byId, links)).length * 3 >=
    internal.length * 2
  );
}

/** Structural checks also apply to authored text; generated eligibility has a versioned rule. */
export function mountainRangeGeometryError(
  map: RegionMap,
  geometry: MountainRangeGeometry,
  generated = false,
): string | null {
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const forms = classifyRegionLandforms(map).byNodeId;
  const membership = new Set(geometry.mapNodeIds);
  if (
    membership.size !== geometry.mapNodeIds.length ||
    geometry.spineNodeIds.length < 5 ||
    new Set(geometry.spineNodeIds).size !== geometry.spineNodeIds.length
  )
    return 'mountain range needs distinct membership and a simple spine';
  const nodes = geometry.mapNodeIds.map((id) => byId.get(id));
  if (
    nodes.some(
      (node) =>
        !node ||
        !dry(node) ||
        !['mountain', 'highMountain'].includes(forms.get(node.id) ?? '') ||
        !Number.isFinite(node.elevation) ||
        !Number.isFinite(mountainCellArea(node)) ||
        mountainCellArea(node) <= EPSILON ||
        ![node.center, ...node.polygon.vertices].every(
          (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
        ),
    )
  )
    return 'mountain range cites invalid mountain terrain';
  if (geometry.spineNodeIds.some((id) => !membership.has(id)))
    return 'mountain range spine leaves its membership';
  const links = adjacency(map);
  if (components(nodes as MapNode[], links).length !== 1)
    return 'mountain range membership is disconnected';
  if (generated) {
    const eligible = map.nodes.filter((node) =>
      ['mountain', 'highMountain'].includes(forms.get(node.id) ?? ''),
    );
    const complete = components(eligible, links).find((group) =>
      group.some((node) => membership.has(node.id)),
    )!;
    if (complete.length !== membership.size)
      return 'mountain range omits part of its mountain component';
    if (geometry.mapNodeIds.some((id, i) => i > 0 && id <= geometry.mapNodeIds[i - 1]))
      return 'mountain range membership is not in stable order';
  }
  for (let i = 1; i < geometry.spineNodeIds.length; i++) {
    const before = geometry.spineNodeIds[i - 1],
      after = geometry.spineNodeIds[i];
    if (
      distance(byId.get(before)!.center, byId.get(after)!.center) <= EPSILON ||
      !links.get(before)?.includes(after) ||
      !mountainSegmentContained(
        byId.get(before)!.center,
        byId.get(after)!.center,
        nodes as MapNode[],
      )
    )
      return 'mountain range spine has an unsupported segment';
  }
  return generated && !qualifies(map, geometry, links)
    ? 'mountain range does not meet its ridge evidence rule'
    : null;
}

/** Candidate components for diagnostic review; eligibility is checked separately. */
export function mountainRangeCandidates(map: RegionMap): MountainRangeGeometry[] {
  const forms = classifyRegionLandforms(map).byNodeId;
  const nodes = map.nodes
    .filter((node) => ['mountain', 'highMountain'].includes(forms.get(node.id) ?? ''))
    .sort((a, b) => a.id - b.id);
  const links = adjacency(map);
  return components(nodes, links)
    .filter((group) => group.length >= 5)
    .map((group) => ({
      mapNodeIds: group.map((node) => node.id),
      spineNodeIds: representativeSpine(group, links),
    }));
}

/** Realized geography only: no RNG draws, mutation, or fabricated mountain cells. */
export function detectMountainRanges(map: RegionMap): MountainRangeGeometry[] {
  return mountainRangeCandidates(map)
    .filter((geometry) => mountainRangeGeometryError(map, geometry, true) === null)
    .sort(
      (a, b) =>
        mountainSpineLength(map, b.spineNodeIds) - mountainSpineLength(map, a.spineNodeIds) ||
        b.mapNodeIds.reduce(
          (sum, id) => sum + mountainCellArea(map.nodes.find((node) => node.id === id)!),
          0,
        ) -
          a.mapNodeIds.reduce(
            (sum, id) => sum + mountainCellArea(map.nodes.find((node) => node.id === id)!),
            0,
          ) ||
        a.mapNodeIds[0] - b.mapNodeIds[0],
    )
    .slice(0, 3);
}
