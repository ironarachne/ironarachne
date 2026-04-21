/**
 * Inputs and outputs for procedural architectural style generation.
 * Designed to be consumed later by a building / floorplan generator.
 */

import type { Resource } from '../resources/resource_types';

export type BuildingPurpose =
  | 'residential'
  | 'defensive'
  | 'civic'
  | 'religious'
  | 'storage'
  | 'commercial';

/**
 * Human band for settlement density. Map numeric 0–1 with
 * `populationDensityToBand` when callers have a scalar.
 */
export type PopulationDensityBand = 'low' | 'medium' | 'high';

export type DecorativeStyleId =
  | 'carved_stone'
  | 'painted_plaster'
  | 'tile_inlay'
  | 'metalwork'
  | 'wood_carving'
  | 'minimal';

export type SiteSubstrate = 'sandy' | 'rocky' | 'clay_rich' | 'peat' | 'mixed';

export type SiteRelief = 'flat' | 'rolling' | 'mountainous';

export type ArchitecturalSiteContext = {
  substrate: SiteSubstrate;
  relief: SiteRelief;
  coastal?: boolean;
  high_altitude?: boolean;
  flood_prone?: boolean;
  /** Echo of terrain / geology for fine rules (optional). */
  predominantRockTypes?: string[];
  soilTypes?: string[];
};

export type StructuralSystem =
  | 'post_and_beam'
  | 'load_bearing_masonry'
  | 'cob_or_adobe'
  | 'hybrid_timber_and_masonry';

export type MassingStyle =
  | 'compact_blocks'
  | 'courtyard_clusters'
  | 'linear_spread'
  | 'terraced_steps';

export type RoofStyle =
  | 'steep_thatch'
  | 'shallow_tile'
  | 'flat_or_low'
  | 'pitched_board'
  | 'gable_roof'
  | 'hip_roof'
  | 'gambrel'
  | 'mansard'
  | 'shed_mono_pitch'
  | 'barrel_vault'
  | 'domed'
  | 'clay_barrel_tile'
  | 'standing_seam_metal'
  | 'green_living_roof'
  | 'cross_gabled';

export type OpeningStyle = 'generous' | 'moderate' | 'narrow_defensive';

/** Relative window count vs blank wall (for generators / narrative). */
export type WindowCountBand = 'sparse' | 'moderate' | 'rich';

export type WindowArrangement =
  | 'regular_grid'
  | 'punched_staggered'
  | 'vertical_banded_pairs'
  | 'horizontal_ribbon'
  | 'clerestory_row'
  | 'courtyard_oriented'
  | 'corner_towers';

export type WindowShape =
  | 'rectangular'
  | 'segmental_arch'
  | 'full_round'
  | 'lancet'
  | 'small_square';

/**
 * What fills the light opening: glass, open/lattice, paper, membrane, etc.
 * Fantasy-appropriate; not a materials-science catalog.
 */
export type WindowFillKind =
  | 'glass_clear'
  | 'glass_leaded'
  | 'paper_translucent'
  | 'open_to_shutter'
  | 'lattice_screen'
  | 'oiled_hide_or_fabric'
  | 'mica_or_selenite'
  | 'woven_reed_mat'
  | 'metal_grille_backed'
  | 'none_louver_vent_only';

export type WindowingStyle = {
  countBand: WindowCountBand;
  arrangement: WindowArrangement;
  shape: WindowShape;
  fillPrimary: WindowFillKind;
  /** Inner shutter, storm layer, or paired system (optional). */
  fillSecondary?: WindowFillKind;
};

export type BuildingAdditionRole = 'functional' | 'ornamental' | 'both';

/**
 * Projecting elements, galleries, and ornamental bands beyond base massing.
 * Picked to align with building purposes (e.g. machicolations for defense).
 */
export type BuildingAdditionKind =
  | 'balcony'
  | 'widow_walk'
  | 'roof_terrace'
  | 'loggia'
  | 'arcade'
  | 'oriel_window'
  | 'bay_projection'
  | 'machicolations'
  | 'bartizan'
  | 'wall_walk'
  | 'flying_buttress'
  | 'entry_canopy'
  | 'loading_bay_cover'
  | 'drying_gallery'
  | 'belfry'
  | 'cornice_drip_band'
  | 'pergola'
  | 'external_stair';

export type BuildingAddition = {
  kind: BuildingAdditionKind;
  role: BuildingAdditionRole;
};

export type BuildingAdditionCatalogEntry = {
  kind: BuildingAdditionKind;
  role: BuildingAdditionRole;
  eligiblePurposes: BuildingPurpose[];
  weight: number;
  requiresMasonry?: boolean;
  requiresWood?: boolean;
};

export type ArchitecturalStyle = {
  /** Short generated label for UI or lists. */
  label: string;
  primaryMaterials: string[];
  secondaryMaterials: string[];
  structuralSystem: StructuralSystem;
  massing: MassingStyle;
  roof: RoofStyle;
  openings: OpeningStyle;
  /** Window count, rhythm, shape, and fill (glass vs open vs other). */
  windows: WindowingStyle;
  /** Balconies, galleries, buttresses, etc., chosen for the stated purposes. */
  buildingAdditions: BuildingAddition[];
  /** Decorative vocabularies that survived material + site filtering. */
  activeDecorations: DecorativeStyleId[];
  /** Narrative tags for climate and site (e.g. deep_eaves_for_rain). */
  siteAdaptations: string[];
  purposesEmphasized: BuildingPurpose[];
  seed: string;
  /** Forward-compatible hints for a future building generator. */
  generatorHints?: {
    preferredStoreys: 1 | 2 | 3;
    courtyardLikelihood: number;
    emphasisVertical: boolean;
  };
};

export type GenerateArchitecturalStyleConfig = {
  seed: string;
  availableResources: Resource[];
  purposes: BuildingPurpose[];
  /** 0 = sparse, 1 = very dense; or pass a band via `populationDensityBand`. */
  populationDensity?: number;
  populationDensityBand?: PopulationDensityBand;
  decorativeStyles: DecorativeStyleId[];
  site: ArchitecturalSiteContext;
};
