import type { MapNode, RegionMap } from './map_graph';
import { classifyRegionLandforms, type LandformClass } from './region_terrain';
import { riverPolygonArea } from './river_geometry';
import type { DesertBiomeKind, DesertCellProfile, DesertOasisSite } from './desert_terrain_types';

/** Exact current biome names plus explicit historical aliases. */
export function desertBiomeKind(biome: string | undefined): DesertBiomeKind | null {
  switch (biome?.trim().toLowerCase()) {
    case 'subtropical desert':
    case 'hot desert':
      return 'warm';
    case 'cold desert':
      return 'cold';
    case 'desert':
      return 'unspecified';
    default:
      return null;
  }
}

export function desertCellProfile(
  node: MapNode,
  landform: LandformClass,
): DesertCellProfile | null {
  const biomeKind = desertBiomeKind(node.biomeId);
  if (biomeKind === null || node.isWater || node.isOcean) return null;
  return {
    nodeId: node.id,
    biomeKind,
    landform,
    cactusEligible:
      biomeKind !== 'cold' &&
      landform === 'plain' &&
      Number.isFinite(node.temperature) &&
      node.temperature >= 20,
  };
}

/** Derive enclosed small freshwater lakes; moisture and rivers cannot manufacture a pool. */
export function deriveDesertOasisSites(map: RegionMap): DesertOasisSite[] {
  const areaLimit = map.width * map.height * 0.01;
  if (!Number.isFinite(areaLimit) || map.width <= 0 || map.height <= 0) return [];
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const landforms = classifyRegionLandforms(map).byNodeId;
  const visited = new Set<number>();
  const sites: DesertOasisSite[] = [];
  for (const start of [...map.nodes].sort((a, b) => a.id - b.id)) {
    if (!start.isWater || start.isOcean || visited.has(start.id)) continue;
    const water: MapNode[] = [];
    const boundary = new Set<number>();
    const stack = [start];
    let enclosed = true;
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      water.push(node);
      if (
        node.polygon.vertices.length < 3 ||
        node.polygon.vertices.some(
          (p) =>
            !Number.isFinite(p.x) ||
            !Number.isFinite(p.y) ||
            p.x <= 0 ||
            p.y <= 0 ||
            p.x >= map.width ||
            p.y >= map.height,
        )
      )
        enclosed = false;
      for (const id of node.neighbors) {
        const neighbor = byId.get(id);
        if (!neighbor || neighbor.isOcean) {
          enclosed = false;
        } else if (neighbor.isWater) {
          if (!visited.has(id)) stack.push(neighbor);
        } else {
          boundary.add(id);
        }
      }
    }
    const waterArea = water.reduce(
      (area, node) => area + riverPolygonArea(node.polygon.vertices),
      0,
    );
    if (
      !enclosed ||
      !Number.isFinite(waterArea) ||
      waterArea <= 0 ||
      waterArea > areaLimit ||
      boundary.size === 0
    )
      continue;
    if ([...boundary].some((id) => desertBiomeKind(byId.get(id)!.biomeId) === null)) continue;
    const shoreNodeIds = [...boundary]
      .filter((id) => {
        const landform = landforms.get(id);
        return landform !== undefined && desertCellProfile(byId.get(id)!, landform)?.cactusEligible;
      })
      .sort((a, b) => a - b);
    if (shoreNodeIds.length === 0) continue;
    const waterNodeIds = water.map((node) => node.id).sort((a, b) => a - b);
    sites.push({ id: `desert-oasis:${waterNodeIds[0]}`, waterNodeIds, shoreNodeIds, waterArea });
  }
  return sites;
}
