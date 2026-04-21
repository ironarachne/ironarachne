import { RNG } from '@ironarachne/rng';
import type {
  ArchitecturalSiteContext,
  BuildingPurpose,
  MassingStyle,
  OpeningStyle,
  PopulationDensityBand,
  StructuralSystem,
  WindowArrangement,
  WindowCountBand,
  WindowFillKind,
  WindowingStyle,
  WindowShape,
} from './architectural_style_types';

type Rng = InstanceType<typeof RNG>;

function hasPurpose(purposes: BuildingPurpose[], p: BuildingPurpose): boolean {
  return purposes.includes(p);
}

function baseCountFromOpenings(o: OpeningStyle): WindowCountBand {
  if (o === 'generous') {
    return 'rich';
  }
  if (o === 'narrow_defensive') {
    return 'sparse';
  }
  return 'moderate';
}

/**
 * Derives window rhythm, shape, and fill from opening style, purpose, massing, structure, and site.
 * Call with a dedicated RNG (e.g. `new RNG(\`\${seed}:windowing\`)`) so other style picks stay stable.
 */
export function buildWindowingStyle(
  config: {
    openingStyle: OpeningStyle;
    purposes: BuildingPurpose[];
    populationBand: PopulationDensityBand;
    massing: MassingStyle;
    structuralSystem: StructuralSystem;
    site: ArchitecturalSiteContext;
    hasWood: boolean;
    hasMetal: boolean;
    hasMasonry: boolean;
  },
  rng: Rng,
): WindowingStyle {
  let countBand = baseCountFromOpenings(config.openingStyle);

  if (hasPurpose(config.purposes, 'storage') && rng.int(1, 100) > 25) {
    countBand = 'sparse';
  }
  if (hasPurpose(config.purposes, 'religious') && config.openingStyle === 'generous') {
    countBand = rng.item(['moderate', 'rich'] as const);
  }
  if (config.populationBand === 'high' && countBand === 'sparse' && rng.int(1, 100) > 60) {
    countBand = 'moderate';
  }
  if (config.site.high_altitude && rng.int(1, 100) > 35) {
    countBand = countBand === 'rich' ? 'moderate' : 'sparse';
  }

  let arrangement: WindowArrangement = 'regular_grid';
  if (config.massing === 'courtyard_clusters') {
    arrangement = rng.item(['courtyard_oriented', 'punched_staggered', 'vertical_banded_pairs'] as const);
  } else if (config.massing === 'linear_spread') {
    arrangement = rng.item(['horizontal_ribbon', 'regular_grid', 'punched_staggered'] as const);
  } else if (config.massing === 'terraced_steps') {
    arrangement = rng.item(['punched_staggered', 'clerestory_row', 'regular_grid'] as const);
  } else {
    arrangement = rng.item([
      'regular_grid',
      'punched_staggered',
      'vertical_banded_pairs',
      'horizontal_ribbon',
    ] as const);
  }

  if (hasPurpose(config.purposes, 'religious') && rng.int(1, 100) > 40) {
    arrangement = rng.item(['vertical_banded_pairs', 'clerestory_row', 'corner_towers'] as const);
  }
  if (hasPurpose(config.purposes, 'defensive')) {
    arrangement = rng.item(['punched_staggered', 'corner_towers', 'regular_grid'] as const);
  }
  if (hasPurpose(config.purposes, 'commercial') && config.massing === 'compact_blocks') {
    arrangement = rng.item(['horizontal_ribbon', 'regular_grid'] as const);
  }

  let shape: WindowShape = 'rectangular';
  if (config.structuralSystem === 'load_bearing_masonry' || config.structuralSystem === 'hybrid_timber_and_masonry') {
    shape = rng.item(['rectangular', 'segmental_arch', 'small_square', 'full_round'] as const);
  } else if (config.structuralSystem === 'cob_or_adobe') {
    shape = rng.item(['small_square', 'rectangular'] as const);
  } else {
    shape = rng.item(['rectangular', 'small_square', 'lancet'] as const);
  }

  if (hasPurpose(config.purposes, 'religious') && config.openingStyle !== 'narrow_defensive') {
    shape = rng.item(['lancet', 'full_round', 'segmental_arch', 'rectangular'] as const);
  }
  if (config.openingStyle === 'narrow_defensive') {
    shape = rng.item(['small_square', 'rectangular'] as const);
  }

  let fillPrimary: WindowFillKind = 'glass_clear';
  if (config.openingStyle === 'narrow_defensive') {
    fillPrimary = rng.item([
      'metal_grille_backed',
      'none_louver_vent_only',
      'woven_reed_mat',
      'open_to_shutter',
    ] as const);
  } else if (hasPurpose(config.purposes, 'storage')) {
    fillPrimary = rng.item(['none_louver_vent_only', 'lattice_screen', 'open_to_shutter'] as const);
  } else if (config.structuralSystem === 'post_and_beam' && config.hasWood && rng.int(1, 100) > 55) {
    fillPrimary = rng.item(['paper_translucent', 'open_to_shutter', 'glass_clear'] as const);
  } else if (config.structuralSystem === 'cob_or_adobe') {
    fillPrimary = rng.item([
      'oiled_hide_or_fabric',
      'lattice_screen',
      'woven_reed_mat',
      'glass_clear',
    ] as const);
  } else if (hasPurpose(config.purposes, 'religious')) {
    fillPrimary = rng.item(['glass_leaded', 'glass_clear', 'mica_or_selenite'] as const);
  } else if (
    config.hasMasonry &&
    (config.structuralSystem === 'load_bearing_masonry' ||
      config.structuralSystem === 'hybrid_timber_and_masonry') &&
    rng.int(1, 100) > 50
  ) {
    fillPrimary = rng.item(['glass_leaded', 'glass_clear'] as const);
  } else if (config.site.coastal && rng.int(1, 100) > 45) {
    fillPrimary = rng.item(['glass_leaded', 'open_to_shutter', 'glass_clear'] as const);
  }

  if (
    fillPrimary === 'glass_clear' &&
    config.hasMetal &&
    rng.int(1, 100) > 70 &&
    config.openingStyle !== 'generous'
  ) {
    fillPrimary = rng.item(['metal_grille_backed', 'glass_clear'] as const);
  }

  let fillSecondary: WindowFillKind | undefined;
  if (
    (fillPrimary === 'glass_clear' || fillPrimary === 'glass_leaded') &&
    config.hasWood &&
    rng.int(1, 100) > 42
  ) {
    fillSecondary = rng.item(['open_to_shutter', 'paper_translucent'] as const);
  }
  if (config.site.high_altitude && (fillPrimary === 'glass_clear' || fillPrimary === 'glass_leaded')) {
    if (rng.int(1, 100) > 30) {
      fillSecondary = fillSecondary ?? rng.item(['open_to_shutter', 'paper_translucent'] as const);
    }
  }

  return {
    countBand,
    arrangement,
    shape,
    fillPrimary,
    fillSecondary,
  };
}
