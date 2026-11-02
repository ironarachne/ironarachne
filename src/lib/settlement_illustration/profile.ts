import type {
  LandscapeKind,
  PanoramaInput,
  PanoramaProfile,
  PlantKind,
} from './settlement_illustration_types';
const BIOMES: Record<string, [LandscapeKind, PlantKind, number]> = {
  'tropical rainforest': ['woodland', 'tropical', 1],
  'tropical seasonal forest': ['woodland', 'tropical', 0.8],
  'tropical savanna': ['grassland', 'grass', 0.5],
  'subtropical desert': ['desert', 'cactus', 0.15],
  'temperate rainforest': ['woodland', 'conifer', 1],
  'temperate deciduous forest': ['woodland', 'broadleaf', 0.9],
  'mediterranean woodland': ['woodland', 'scrub', 0.5],
  'temperate grassland': ['grassland', 'grass', 0.6],
  'cold desert': ['desert', 'scrub', 0.1],
  'boreal forest': ['woodland', 'conifer', 0.9],
  tundra: ['cold', 'scrub', 0.15],
  'ice cap': ['cold', 'none', 0],
  'alpine tundra': ['highland', 'scrub', 0.15],
  'montane forest': ['highland', 'conifer', 0.85],
  'montane grassland': ['highland', 'grass', 0.4],
  'flooded grassland': ['wetland', 'reed', 0.6],
  'mangrove forest': ['wetland', 'tropical', 0.9],
  'freshwater lake': ['wetland', 'reed', 0.4],
  'freshwater river': ['wetland', 'reed', 0.4],
  'freshwater wetland': ['wetland', 'reed', 0.8],
  'intertidal zone': ['coastal', 'scrub', 0.15],
  'kelp forest': ['coastal', 'none', 0],
  'coral reef': ['coastal', 'none', 0],
  estuary: ['coastal', 'reed', 0.3],
  'pelagic ocean': ['coastal', 'none', 0],
  'abyssal ocean': ['coastal', 'none', 0],
};
const COUNTS: Record<string, [number, number]> = {
  hamlet: [3, 7],
  village: [8, 15],
  town: [16, 28],
  borough: [29, 44],
  city: [45, 68],
  metropolis: [69, 96],
};
export function resolvePanoramaProfile(input: PanoramaInput): PanoramaProfile {
  const [landscape, vegetation, vegetationDensity] = BIOMES[input.biome.name] ?? [
    input.biome.isAquatic ? 'coastal' : 'neutral',
    'none',
    0,
  ];
  const [min, max] = COUNTS[input.category.name] ?? [3, 7];
  const fraction = Math.max(
    0,
    Math.min(
      1,
      (input.population - input.category.minSize) /
        Math.max(1, input.category.maxSize - input.category.minSize),
    ),
  );
  const buildingCount = Math.round(min + fraction * (max - min));
  return {
    landscape,
    vegetation,
    vegetationDensity,
    buildingCount,
    settlementSpread: 260 + Math.sqrt(buildingCount) * 48,
  };
}
