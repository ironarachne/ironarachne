import { RNG } from '@ironarachne/rng';
import type { Resource } from '../resources/resource_types';
import { inferStructuralAffordance } from '../resources/infer_structural_affordance';
import type { BuildingStructuralAffordance } from '../resources/structural_affordance';
import type {
  ArchitecturalSiteContext,
  ArchitecturalStyle,
  BuildingPurpose,
  GenerateArchitecturalStyleConfig,
  MassingStyle,
  OpeningStyle,
  PopulationDensityBand,
  RoofStyle,
  StructuralSystem,
} from './architectural_style_types';
import { DECORATIVE_STYLE_ENTRIES } from './decorative_style_data';
import type { DecorativeStyleId } from './architectural_style_types';
import { populationDensityToBand } from './population_density';
import { buildBuildingAdditions } from './building_additions_generation';
import { buildWindowingStyle } from './windowing_generation';

type Rng = InstanceType<typeof RNG>;

function getNumericProperty(resource: Resource, name: string): number | null {
  const p = resource.properties.find((x) => x.name === name);
  if (p == null) {
    return null;
  }
  if (typeof p.value === 'number') {
    return p.value;
  }
  const parsed = Number.parseFloat(String(p.value));
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveDensityBand(config: GenerateArchitecturalStyleConfig): PopulationDensityBand {
  if (config.populationDensityBand != null) {
    return config.populationDensityBand;
  }
  if (typeof config.populationDensity === 'number') {
    return populationDensityToBand(config.populationDensity);
  }
  return 'medium';
}

function hasPurpose(purposes: BuildingPurpose[], p: BuildingPurpose): boolean {
  return purposes.includes(p);
}

function siteMaterialMultiplier(
  resource: Resource,
  affordance: BuildingStructuralAffordance,
  site: ArchitecturalSiteContext,
): number {
  let m = 1;
  const density = getNumericProperty(resource, 'density') ?? 1500;
  const major = resource.major_type.toLowerCase();

  if (site.substrate === 'sandy') {
    if (density > 2400) {
      m *= 0.82;
    }
    if (major === 'wood' || major === 'bamboo' || major === 'thatch') {
      m *= 1.12;
    }
    if (major === 'earth') {
      m *= 1.08;
    }
  }
  if (site.substrate === 'rocky' || site.relief === 'mountainous') {
    if (major === 'stone' || major === 'brick') {
      m *= 1.18;
    }
  }
  if (site.substrate === 'clay_rich') {
    if (major === 'earth' || major === 'brick') {
      m *= 1.15;
    }
  }
  if (site.coastal) {
    m *= 1 + affordance.weatherResistance * 0.08;
  }
  if (site.flood_prone && major === 'earth' && affordance.earthworkSuitability > 0.4) {
    m *= 0.75;
  }
  if (site.high_altitude && major === 'stone') {
    m *= 1.06;
  }
  return m;
}

function purposeMultiplier(resource: Resource, affordance: BuildingStructuralAffordance, purposes: BuildingPurpose[]): number {
  let m = 1;
  const major = resource.major_type.toLowerCase();

  if (hasPurpose(purposes, 'defensive')) {
    if (major === 'stone' || major === 'brick') {
      m *= 1.14;
    }
    if (major === 'wood') {
      m *= 0.96;
    }
  }
  if (hasPurpose(purposes, 'religious')) {
    if (major === 'stone' || major === 'lime') {
      m *= 1.08;
    }
  }
  if (hasPurpose(purposes, 'storage')) {
    if (affordance.roles.includes('ornament')) {
      m *= 0.92;
    }
  }
  return m;
}

function densityMultiplier(affordance: BuildingStructuralAffordance, band: PopulationDensityBand): number {
  if (band === 'high') {
    if (affordance.compressiveSuitability >= 0.45) {
      return 1.1;
    }
    return 0.98;
  }
  if (band === 'low') {
    return 1.02;
  }
  return 1;
}

function scoreResource(
  resource: Resource,
  affordance: BuildingStructuralAffordance,
  site: ArchitecturalSiteContext,
  purposes: BuildingPurpose[],
  band: PopulationDensityBand,
): number {
  if (!affordance.roles.includes('primary_structure') && affordance.roles.includes('ornament')) {
    /* Ores and pure ornament: keep out of primary race unless they have some compressive use */
    if (affordance.compressiveSuitability < 0.18 && affordance.tensileSuitability < 0.2) {
      return affordance.compressiveSuitability * 0.3;
    }
  }

  const base =
    affordance.compressiveSuitability * 0.42 +
    affordance.tensileSuitability * 0.28 +
    affordance.weatherResistance * 0.12 +
    affordance.earthworkSuitability * 0.08;

  return (
    base *
    siteMaterialMultiplier(resource, affordance, site) *
    purposeMultiplier(resource, affordance, purposes) *
    densityMultiplier(affordance, band)
  );
}

function pickStructuralSystem(
  ranked: { resource: Resource; affordance: BuildingStructuralAffordance }[],
  rng: Rng,
): StructuralSystem {
  const top = ranked[0];
  const second = ranked[1];
  if (!top) {
    return 'post_and_beam';
  }

  const stoneLike = (r: { resource: Resource; affordance: BuildingStructuralAffordance } | undefined) =>
    r &&
    (r.resource.major_type.toLowerCase() === 'stone' || r.resource.major_type.toLowerCase() === 'brick');

  const earthLike = (r: { resource: Resource; affordance: BuildingStructuralAffordance } | undefined) =>
    r && (r.resource.major_type.toLowerCase() === 'earth' || r.affordance.earthworkSuitability > 0.55);

  const woodLike = (r: { resource: Resource; affordance: BuildingStructuralAffordance } | undefined) =>
    r &&
    (r.resource.major_type.toLowerCase() === 'wood' ||
      r.resource.major_type.toLowerCase() === 'bamboo');

  if (earthLike(top) || (earthLike(second) && rng.int(1, 100) > 40)) {
    return 'cob_or_adobe';
  }

  if (stoneLike(top) && top.affordance.compressiveSuitability >= 0.48) {
    if (woodLike(second) && second.affordance.tensileSuitability >= 0.42) {
      return rng.int(1, 100) > 35 ? 'hybrid_timber_and_masonry' : 'load_bearing_masonry';
    }
    return 'load_bearing_masonry';
  }

  if (woodLike(top) || (top.resource.major_type.toLowerCase() === 'bamboo')) {
    return 'post_and_beam';
  }

  if (stoneLike(second) && woodLike(top)) {
    return 'hybrid_timber_and_masonry';
  }

  return rng.int(1, 100) > 50 ? 'load_bearing_masonry' : 'post_and_beam';
}

function pickMassing(
  band: PopulationDensityBand,
  site: ArchitecturalSiteContext,
  rng: Rng,
): MassingStyle {
  if (site.relief === 'mountainous') {
    return rng.int(1, 100) > 30 ? 'terraced_steps' : 'compact_blocks';
  }
  if (band === 'high') {
    return rng.int(1, 100) > 45 ? 'courtyard_clusters' : 'compact_blocks';
  }
  if (band === 'low') {
    return rng.int(1, 100) > 35 ? 'linear_spread' : 'compact_blocks';
  }
  return rng.item(['compact_blocks', 'courtyard_clusters', 'linear_spread'] as const);
}

function primaryNamesSuggestWood(names: string): boolean {
  return (
    names.includes('timber') ||
    names.includes('pine') ||
    names.includes('oak') ||
    names.includes('bamboo')
  );
}

function primaryNamesSuggestHeavyMasonry(names: string): boolean {
  return (
    names.includes('granite') ||
    names.includes('sandstone') ||
    names.includes('brick') ||
    names.includes('adobe') ||
    names.includes('rammed') ||
    names.includes('slate')
  );
}

function pickRoof(
  primaryNames: string[],
  site: ArchitecturalSiteContext,
  purposes: BuildingPurpose[],
  band: PopulationDensityBand,
  rng: Rng,
): RoofStyle {
  const names = primaryNames.join(' ').toLowerCase();
  const religious = hasPurpose(purposes, 'religious');
  const civic = hasPurpose(purposes, 'civic');
  const woodForward = primaryNamesSuggestWood(names);
  const masonryHeavy = primaryNamesSuggestHeavyMasonry(names);

  if ((religious || civic) && masonryHeavy && rng.int(1, 100) > 52) {
    return rng.item(['barrel_vault', 'domed'] as const);
  }

  if (names.includes('thatch')) {
    return site.flood_prone
      ? 'steep_thatch'
      : rng.item(['steep_thatch', 'pitched_board', 'hip_roof', 'gambrel'] as const);
  }

  if (names.includes('slate')) {
    return rng.item(['shallow_tile', 'clay_barrel_tile', 'cross_gabled', 'hip_roof'] as const);
  }

  if (
    (names.includes('adobe') || names.includes('rammed')) &&
    site.substrate === 'peat' &&
    rng.int(1, 100) > 58
  ) {
    return 'green_living_roof';
  }

  if (woodForward && rng.int(1, 100) > 38) {
    return rng.item([
      'gable_roof',
      'pitched_board',
      'hip_roof',
      'gambrel',
      'cross_gabled',
      'shed_mono_pitch',
      'mansard',
    ] as const);
  }

  if (names.includes('brick')) {
    return rng.item([
      'shallow_tile',
      'clay_barrel_tile',
      'hip_roof',
      'gable_roof',
      'cross_gabled',
      'mansard',
    ] as const);
  }

  if (band === 'high' && rng.int(1, 100) > 48) {
    return rng.item(['mansard', 'flat_or_low', 'cross_gabled', 'standing_seam_metal'] as const);
  }

  if (site.coastal && rng.int(1, 100) > 52) {
    return rng.item(['standing_seam_metal', 'pitched_board', 'gable_roof', 'hip_roof'] as const);
  }

  if (names.includes('tile')) {
    return rng.item(['shallow_tile', 'clay_barrel_tile', 'hip_roof'] as const);
  }

  return rng.item([
    'flat_or_low',
    'pitched_board',
    'gable_roof',
    'hip_roof',
    'gambrel',
    'mansard',
    'shed_mono_pitch',
    'steep_thatch',
    'shallow_tile',
    'clay_barrel_tile',
    'standing_seam_metal',
    'green_living_roof',
    'cross_gabled',
  ] as const);
}

function pickOpenings(purposes: BuildingPurpose[], rng: Rng): OpeningStyle {
  if (hasPurpose(purposes, 'defensive')) {
    return rng.int(1, 100) > 15 ? 'narrow_defensive' : 'moderate';
  }
  if (hasPurpose(purposes, 'religious')) {
    return rng.int(1, 100) > 40 ? 'generous' : 'moderate';
  }
  if (hasPurpose(purposes, 'storage')) {
    return 'moderate';
  }
  return rng.item(['generous', 'moderate'] as const);
}

function maxStoneHardness(resources: Resource[]): number {
  let max = 0;
  for (const r of resources) {
    if (r.major_type.toLowerCase() !== 'stone') {
      continue;
    }
    const h = getNumericProperty(r, 'hardness');
    if (h != null && h > max) {
      max = h;
    }
  }
  return max;
}

function hasWood(resources: Resource[]): boolean {
  return resources.some((r) => {
    const m = r.major_type.toLowerCase();
    return m === 'wood' || m === 'timber' || m === 'bamboo';
  });
}

function hasMasonryOrPlaster(resources: Resource[]): boolean {
  return resources.some((r) => {
    const m = r.major_type.toLowerCase();
    return m === 'stone' || m === 'brick' || m === 'earth' || m === 'lime' || m === 'ceramic';
  });
}

function hasMetal(resources: Resource[]): boolean {
  return resources.some((r) => r.major_type.toLowerCase() === 'metal');
}

function filterDecorations(
  requested: DecorativeStyleId[],
  primarySecondary: Resource[],
): DecorativeStyleId[] {
  const stoneHard = maxStoneHardness(primarySecondary);
  const wood = hasWood(primarySecondary);
  const mason = hasMasonryOrPlaster(primarySecondary);
  const metal = hasMetal(primarySecondary);

  const out: DecorativeStyleId[] = [];
  for (const id of requested) {
    const entry = DECORATIVE_STYLE_ENTRIES.find((e) => e.id === id);
    if (!entry) {
      continue;
    }
    if (entry.requiresWood && !wood) {
      continue;
    }
    if (entry.requiresMasonryOrPlaster && !mason) {
      continue;
    }
    if (entry.requiresMetalAffordance && !metal) {
      continue;
    }
    if (entry.id === 'carved_stone' && entry.minStoneHardnessForCarving != null) {
      if (stoneHard < entry.minStoneHardnessForCarving) {
        continue;
      }
    }
    out.push(id);
  }
  if (out.length === 0 && requested.includes('minimal')) {
    return ['minimal'];
  }
  return out.length > 0 ? out : ['minimal'];
}

function styleLabel(structural: StructuralSystem, rng: Rng): string {
  const adj = rng.item([
    'vernacular',
    'regional',
    'traditional',
    'local',
    'established',
    'practical',
  ] as const);
  const noun =
    structural === 'load_bearing_masonry'
      ? rng.item(['masonry', 'stonecraft', 'ashlar'] as const)
      : structural === 'post_and_beam'
        ? rng.item(['timber', 'carpentry', 'frame'] as const)
        : structural === 'cob_or_adobe'
          ? rng.item(['earthen', 'adobe', 'earthwork'] as const)
          : rng.item(['composite', 'hybrid', 'mixed-trade'] as const);
  return `${adj} ${noun} style`;
}

function siteAdaptationTags(site: ArchitecturalSiteContext, roof: RoofStyle): string[] {
  const tags: string[] = [];
  if (site.coastal) {
    tags.push('salt_air_durable_materials');
  }
  if (site.flood_prone) {
    tags.push('raised_floor_plinths');
  }
  if (site.high_altitude) {
    tags.push('steep_roofs_shed_snow');
  }
  if (site.substrate === 'sandy') {
    tags.push('shallow_spread_footings');
  }
  if (site.relief === 'mountainous') {
    tags.push('terraced_footprint');
  }
  if (
    site.flood_prone &&
    (roof === 'steep_thatch' ||
      roof === 'gambrel' ||
      roof === 'gable_roof' ||
      roof === 'hip_roof' ||
      roof === 'clay_barrel_tile' ||
      roof === 'cross_gabled')
  ) {
    tags.push('steep_roof_sheds_rain');
  }
  if (roof === 'green_living_roof') {
    tags.push('roof_soil_retains_moisture');
  }
  if (roof === 'standing_seam_metal') {
    tags.push('metal_roof_resists_wind_lift');
  }
  return tags;
}

function buildGeneratorHints(
  band: PopulationDensityBand,
  purposes: BuildingPurpose[],
  massing: MassingStyle,
  rng: Rng,
): ArchitecturalStyle['generatorHints'] {
  const preferredStoreys: 1 | 2 | 3 =
    band === 'high' && rng.int(1, 100) > 55
      ? rng.int(1, 100) > 40
        ? 3
        : 2
      : band === 'low'
        ? 1
        : rng.item([1, 2] as const);

  let courtyardLikelihood = 0.25;
  if (massing === 'courtyard_clusters') {
    courtyardLikelihood = 0.72;
  } else if (band === 'high') {
    courtyardLikelihood = 0.45;
  }

  const emphasisVertical = hasPurpose(purposes, 'religious') || (band === 'high' && rng.int(1, 100) > 60);

  return {
    preferredStoreys: preferredStoreys as 1 | 2 | 3,
    courtyardLikelihood,
    emphasisVertical,
  };
}

/**
 * Deterministically generates an architectural style from available resources and site context.
 */
export function generateArchitecturalStyle(config: GenerateArchitecturalStyleConfig): ArchitecturalStyle {
  const rng = new RNG(config.seed);
  const band = resolveDensityBand(config);
  const purposes = config.purposes.length > 0 ? config.purposes : (['residential'] as BuildingPurpose[]);

  const scored = config.availableResources.map((resource) => {
    const affordance = inferStructuralAffordance(resource);
    const s = scoreResource(resource, affordance, config.site, purposes, band);
    return { resource, affordance, score: s };
  });

  scored.sort((a, b) => b.score - a.score);

  const ranked = scored.map(({ resource, affordance }) => ({ resource, affordance }));

  const primaryCount = rng.int(1, 2);
  const primary = ranked.slice(0, primaryCount).map((x) => x.resource.name);
  const secondaryStart = primaryCount;
  const secondaryCount = Math.min(3, Math.max(1, ranked.length - primaryCount));
  const secondary = ranked.slice(secondaryStart, secondaryStart + secondaryCount).map((x) => x.resource.name);

  const structuralSystem = pickStructuralSystem(ranked, rng);
  const massing = pickMassing(band, config.site, rng);
  const primaryResources = ranked.slice(0, primaryCount + secondaryCount).map((x) => x.resource);
  const roof = pickRoof(primary, config.site, purposes, band, rng);
  const openings = pickOpenings(purposes, rng);
  const windowRng = new RNG(`${config.seed}:windowing`);
  const windows = buildWindowingStyle(
    {
      openingStyle: openings,
      purposes,
      populationBand: band,
      massing,
      structuralSystem,
      site: config.site,
      hasWood: hasWood(primaryResources),
      hasMetal: hasMetal(primaryResources),
      hasMasonry: hasMasonryOrPlaster(primaryResources),
    },
    windowRng,
  );
  const additionsRng = new RNG(`${config.seed}:building_additions`);
  const buildingAdditions = buildBuildingAdditions(
    {
      purposes,
      populationBand: band,
      structuralSystem,
      massing,
      site: config.site,
      hasWood: hasWood(primaryResources),
      hasMasonry: hasMasonryOrPlaster(primaryResources),
    },
    additionsRng,
  );
  const activeDecorations = filterDecorations(config.decorativeStyles, primaryResources);
  const label = styleLabel(structuralSystem, rng);
  const siteAdaptations = siteAdaptationTags(config.site, roof);

  return {
    label,
    primaryMaterials: primary,
    secondaryMaterials: secondary,
    structuralSystem,
    massing,
    roof,
    openings,
    windows,
    buildingAdditions,
    activeDecorations,
    siteAdaptations,
    purposesEmphasized: [...purposes],
    seed: config.seed,
    generatorHints: buildGeneratorHints(band, purposes, massing, rng),
  };
}
