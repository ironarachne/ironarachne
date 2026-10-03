import type { RNG } from '@ironarachne/rng';
import {
  classifyRegionLandforms,
  type LandformClass,
  type MapNode,
  type RegionMap,
} from '$lib/map';
import {
  generateLandscapeName,
  nameGeneratorSetToStoredPatternSet,
  type LandscapeDirection,
  type LandscapeNameContext,
} from '$lib/names';
import type Region from './region';

// Exact biome keys also support small fixtures and older saved classifications.
const biomeNouns: Record<string, string[]> = {
  forest: ['Woods', 'Forest', 'Woodlands'],
  'tropical rainforest': ['Rainforest', 'Woods'],
  'tropical seasonal forest': ['Woods', 'Forest'],
  'temperate rainforest': ['Rainforest', 'Woods'],
  'temperate deciduous forest': ['Woods', 'Woodlands', 'Forest'],
  'mediterranean woodland': ['Woodlands', 'Woods'],
  'boreal forest': ['Woods', 'Forest'],
  'montane forest': ['Woods', 'Forest'],
  'mangrove forest': ['Mangroves', 'Mangrove Woods'],
  grassland: ['Grasslands'],
  'tropical savanna': ['Savanna', 'Grasslands'],
  'temperate grassland': ['Grasslands'],
  'montane grassland': ['Grasslands'],
  'flooded grassland': ['Wet Grasslands'],
  desert: ['Desert'],
  'subtropical desert': ['Desert'],
  'cold desert': ['Desert'],
  marsh: ['Marshes', 'Wetlands'],
  'freshwater wetland': ['Wetlands', 'Marshes'],
  tundra: ['Tundra'],
  'alpine tundra': ['Tundra'],
  'ice cap': ['Icefields'],
};
const openBiomes = new Set([
  'grassland',
  'tropical savanna',
  'temperate grassland',
  'montane grassland',
]);

/** Titles for region-wide summaries; these do not invent another geographic place. */
export function landscapeSummaryHeading(biome: string): string {
  const summaries: Record<string, string> = {
    forest: 'Woodlands',
    'temperate deciduous forest': 'Woodlands',
    'mediterranean woodland': 'Mediterranean woodlands',
    'montane grassland': 'Montane grasslands',
    'temperate grassland': 'Grasslands',
    grassland: 'Grasslands',
    'flooded grassland': 'Wet grasslands',
    'freshwater wetland': 'Wetlands',
    marsh: 'Marshes',
  };
  const trimmed = biome.trim();
  const label =
    summaries[trimmed] ?? (trimmed ? trimmed[0].toUpperCase() + trimmed.slice(1) : 'Habitats');
  return `${label} across the region`;
}

function namingNouns(
  biome: string,
  nodes: MapNode[],
  landforms: Map<number, LandformClass>,
): string[] {
  const nouns = [...(biomeNouns[biome] ?? ['Country'])];
  const supports = (forms: LandformClass[]) =>
    nodes.filter((node) => forms.includes(landforms.get(node.id)!)).length * 3 >= nodes.length * 2;
  if (supports(['mountain', 'highMountain'])) nouns.push('Mountains', 'Heights');
  else if (supports(['hill'])) {
    nouns.push('Hills', 'Heights');
    if (openBiomes.has(biome)) nouns.push('Downs');
  } else if (openBiomes.has(biome) && supports(['plain'])) nouns.push('Plains');
  return nouns;
}

function namingDirections(nodes: MapNode[], map: RegionMap): LandscapeDirection[] {
  const supports = (test: (node: MapNode) => boolean) =>
    nodes.filter(test).length * 3 >= nodes.length * 2;
  const north = supports((node) => node.center.y < map.height / 3);
  const south = supports((node) => node.center.y > (map.height * 2) / 3);
  const west = supports((node) => node.center.x < map.width / 3);
  const east = supports((node) => node.center.x > (map.width * 2) / 3);
  const directions: LandscapeDirection[] = [];
  if (north) directions.push('north');
  if (south) directions.push('south');
  if (east) directions.push('east');
  if (west) directions.push('west');
  if (north && east) directions.push('northeast');
  if (south && east) directions.push('southeast');
  if (north && west) directions.push('northwest');
  if (south && west) directions.push('southwest');
  const centralX = supports(
    (node) => node.center.x >= map.width / 3 && node.center.x <= (map.width * 2) / 3,
  );
  const centralY = supports(
    (node) => node.center.y >= map.height / 3 && node.center.y <= (map.height * 2) / 3,
  );
  if (centralX && centralY) directions.push('central');
  return directions;
}

/** Name newly generated zones on their own stream; authored and summary facts stay intact. */
export function generateLandscapeNames(
  region: Pick<Region, 'map' | 'facts' | 'dominantCulture'>,
  rng: RNG,
): void {
  const facts = region.facts;
  if (!facts) return;
  const zones = facts.areas
    .filter((area) => area.origin === 'generated' && area.id.startsWith('area:habitat-zone:'))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const landforms = classifyRegionLandforms(region.map).byNodeId;
  const culturePatterns = region.dominantCulture
    ? nameGeneratorSetToStoredPatternSet(region.dominantCulture.nameGenerators)
    : undefined;
  let context: LandscapeNameContext = {
    usedNames: facts.areas.filter((area) => !zones.includes(area)).map((area) => area.name),
    recentStyles: [],
  };
  for (const zone of zones) {
    const ids = new Set(zone.mapNodeIds);
    const nodes = region.map.nodes
      .filter((node) => ids.has(node.id) && !node.isOcean && !node.isWater)
      .sort((a, b) => a.id - b.id);
    if (!nodes.length) continue;
    const result = generateLandscapeName(
      {
        id: zone.id,
        nouns: namingNouns(nodes[0].biomeId ?? '', nodes, landforms),
        directions: namingDirections(nodes, region.map),
        culturePatterns,
      },
      context,
      rng,
    );
    zone.name = result.name;
    context = result.nextContext;
  }
}
