import type { MapNode, RegionMap } from './map_graph';
import { classifyRegionLandforms } from './region_terrain';
import type { TerrainGlyphAssignment, TerrainGlyphFamily } from './terrain_glyph_types';

const MARSH_BIOMES = new Set([
  'flooded grassland',
  'freshwater wetland',
  'swamp',
  'marsh',
  'bog',
  'fen',
]);
const PRAIRIE_BIOMES = new Set(['temperate grassland', 'prairie']);

function vegetationFamily(biome: string): TerrainGlyphFamily | null {
  if (MARSH_BIOMES.has(biome)) return 'marsh';
  if (biome.includes('forest') || biome.includes('woodland')) {
    if (/tropical|mangrove|jungle/.test(biome)) return 'treePalm';
    if (/boreal|montane|coniferous|pine/.test(biome)) return 'treeConifer';
    return 'treeDeciduous';
  }
  return PRAIRIE_BIOMES.has(biome) ? 'prairie' : null;
}

function familyForNode(
  node: MapNode,
  landform: TerrainGlyphAssignment['landform'],
): TerrainGlyphFamily | null {
  const vegetation = vegetationFamily(node.biomeId?.trim().toLowerCase() ?? '');
  if (landform === 'highMountain') return 'mountainHigh';
  if (landform === 'mountain') return 'mountain';
  if (vegetation === 'marsh') return 'marsh';
  if (landform === 'hill') return 'hill';
  return vegetation;
}

/** Single terrain layer, based on the same relative relief classes as the region's prose. */
export function assignTerrainGlyphs(map: RegionMap): Map<number, TerrainGlyphAssignment> {
  const classified = classifyRegionLandforms(map);
  const result = new Map<number, TerrainGlyphAssignment>();
  for (const node of map.nodes) {
    const landform = classified.byNodeId.get(node.id);
    if (landform === undefined) continue;
    const family = familyForNode(node, landform);
    if (family !== null) result.set(node.id, { nodeId: node.id, landform, family });
  }
  return result;
}
