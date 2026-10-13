import { assignTerrainGlyphs } from './terrain_glyph_assignment';
import { isTreeGlyph } from './terrain_glyph_sizing';
import type { MapNode, RegionMap } from './map_graph';
import type { DenseForestGeometry } from './dense_forest_types';

function geography(map: RegionMap) {
  const assignments = assignTerrainGlyphs(map);
  const nodes = new Map(
    [...map.nodes]
      .sort((a, b) => a.id - b.id)
      .filter((node) => {
        const family = assignments.get(node.id)?.family;
        return (
          family !== undefined &&
          family !== 'treeSavanna' &&
          isTreeGlyph(family) &&
          Number.isFinite(node.moisture) &&
          Number.isFinite(node.center.x) &&
          Number.isFinite(node.center.y) &&
          node.polygon.vertices.length >= 3 &&
          node.polygon.vertices.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
        );
      })
      .map((node) => [node.id, node]),
  );
  const links = new Map([...nodes.keys()].map((id) => [id, new Set<number>()]));
  for (const edge of map.edges) {
    const a = nodes.get(edge.d0),
      b = edge.d1 === undefined ? undefined : nodes.get(edge.d1);
    if (
      !a ||
      !b ||
      a.id === b.id ||
      !a.neighbors.includes(b.id) ||
      !b.neighbors.includes(a.id) ||
      !a.edges.includes(edge.id) ||
      !b.edges.includes(edge.id) ||
      assignments.get(a.id)!.family !== assignments.get(b.id)!.family
    )
      continue;
    links.get(a.id)!.add(b.id);
    links.get(b.id)!.add(a.id);
  }
  return { nodes, links };
}

export function denseForestCellArea(node: MapNode): number {
  const points = node.polygon.vertices;
  return (
    Math.abs(
      points.reduce((sum, a, i) => {
        const b = points[(i + 1) % points.length];
        return sum + a.x * b.y - b.x * a.y;
      }, 0),
    ) / 2
  );
}

/** Pure realized-terrain selection; array order and naming RNG never determine membership. */
export function detectDenseForests(map: RegionMap): DenseForestGeometry[] {
  const { nodes, links } = geography(map);
  const remaining = new Set(nodes.keys());
  const patches: DenseForestGeometry[] = [];
  for (const id of nodes.keys()) {
    if (!remaining.delete(id)) continue;
    const component = [id];
    for (let i = 0; i < component.length; i++)
      for (const next of [...links.get(component[i])!].sort((a, b) => a - b))
        if (remaining.delete(next)) component.push(next);
    const limit = Math.floor(component.length / 3);
    if (limit < 3) continue;
    // Graph distance from the boundary makes equally moist interior sites preferable.
    const depth = new Map<number, number>();
    const boundary = component.filter((nodeId) => {
      const node = nodes.get(nodeId)!;
      return links.get(nodeId)!.size < node.edges.length;
    });
    const queue = [...boundary].sort((a, b) => a - b);
    queue.forEach((nodeId) => depth.set(nodeId, 0));
    for (let i = 0; i < queue.length; i++)
      for (const next of [...links.get(queue[i])!].sort((a, b) => a - b))
        if (!depth.has(next)) {
          depth.set(next, depth.get(queue[i])! + 1);
          queue.push(next);
        }
    const seeds = [...component].sort(
      (a, b) =>
        nodes.get(b)!.moisture - nodes.get(a)!.moisture ||
        (depth.get(b) ?? 0) - (depth.get(a) ?? 0) ||
        a - b,
    );
    const seed = nodes.get(seeds[0])!;
    const selected = new Set([seed.id]);
    const frontier = new Set(links.get(seed.id));
    while (selected.size < limit && frontier.size) {
      const next = [...frontier].sort(
        (a, b) =>
          Math.hypot(
            nodes.get(a)!.center.x - seed.center.x,
            nodes.get(a)!.center.y - seed.center.y,
          ) -
            Math.hypot(
              nodes.get(b)!.center.x - seed.center.x,
              nodes.get(b)!.center.y - seed.center.y,
            ) || a - b,
      )[0];
      frontier.delete(next);
      selected.add(next);
      for (const neighbor of links.get(next)!) if (!selected.has(neighbor)) frontier.add(neighbor);
    }
    const mapNodeIds = [...selected].sort((a, b) => a - b);
    if (
      mapNodeIds.length >= 3 &&
      mapNodeIds.every((nodeId) => denseForestCellArea(nodes.get(nodeId)!) > 0)
    )
      patches.push({ mapNodeIds });
  }
  const area = (patch: DenseForestGeometry) =>
    patch.mapNodeIds.reduce((sum, id) => sum + denseForestCellArea(nodes.get(id)!), 0);
  return patches.sort((a, b) => area(b) - area(a) || a.mapNodeIds[0] - b.mapNodeIds[0]).slice(0, 3);
}

/** Authored patches need sound topology too; current generated facts additionally match policy. */
export function denseForestGeometryError(
  map: RegionMap,
  patch: DenseForestGeometry,
): string | null {
  const ids = patch.mapNodeIds;
  if (
    !Array.isArray(ids) ||
    ids.length < 3 ||
    !ids.every(Number.isInteger) ||
    new Set(ids).size !== ids.length ||
    ids.some((id, i) => i > 0 && id <= ids[i - 1])
  )
    return 'dense forest needs sorted distinct numeric cell references';
  const { nodes, links } = geography(map);
  if (ids.some((id) => !nodes.has(id) || denseForestCellArea(nodes.get(id)!) <= 0))
    return 'dense forest contains missing or ineligible terrain';
  const members = new Set(ids),
    visited = new Set([ids[0]]),
    queue = [ids[0]];
  for (let i = 0; i < queue.length; i++)
    for (const next of links.get(queue[i])!)
      if (members.has(next) && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
  return visited.size === ids.length ? null : 'dense forest is disconnected or mixes tree families';
}
