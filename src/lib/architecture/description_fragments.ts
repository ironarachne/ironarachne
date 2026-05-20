import type {
  ArchitecturalStyle,
  BuildingAddition,
  BuildingAdditionKind,
  WindowingStyle,
} from './architectural_style_types';

const STRUCTURAL_PHRASES: Record<ArchitecturalStyle['structuralSystem'], string> = {
  post_and_beam: 'Frames rely on timber posts and beams, with infill carrying little load.',
  load_bearing_masonry: 'Thick masonry walls carry the building weight without a separate frame.',
  cob_or_adobe: 'Monolithic earth walls—adobe or rammed earth—anchor the design.',
  hybrid_timber_and_masonry:
    'Stone or brick shells work together with timber floors and roof frames.',
};

const MASSING_PHRASES: Record<ArchitecturalStyle['massing'], string> = {
  compact_blocks: 'Buildings sit as tight blocks, sharing edges where they meet.',
  courtyard_clusters: 'Rooms wrap inward around shared courts for light and privacy.',
  linear_spread: 'Volumes string out along lanes or contours instead of stacking.',
  terraced_steps: 'Terraces step with the slope, limiting cut-and-fill.',
};

const ROOF_PHRASES: Record<ArchitecturalStyle['roof'], string> = {
  steep_thatch: 'Roofs are steeply pitched, often thatched, to shed rain quickly.',
  shallow_tile: 'Lower pitches suit heavy tiles or stone slates.',
  flat_or_low: 'Roofs stay shallow or nearly flat where climate and span allow.',
  pitched_board: 'Simple pitched roofs use boards or light sheathing over rafters.',
  gable_roof:
    'Classic dual-pitch gables shed water to the long eaves with familiar timber framing.',
  hip_roof: 'Hipped roofs slope on all sides, tying the volume together without tall gable ends.',
  gambrel:
    'Gambrel profiles step the pitch—steeper below, shallower above—gaining headroom in the attic.',
  mansard: 'Mansard shells create a habitable attic story under a shallow upper roof plane.',
  shed_mono_pitch:
    'Single-slope “shed” roofs run rainwater off one edge and suit lean-to additions.',
  barrel_vault: 'Barrel-vaulted roofs read as continuous masonry arches, strong in long halls.',
  domed: 'Domes or onion shells crown the volume, concentrating weight onto a ring or drum.',
  clay_barrel_tile:
    'Interlocking clay barrel tiles cap the pitch with rounded Mediterranean courses.',
  standing_seam_metal: 'Standing-seam metal skins shed weather with few through-fasteners.',
  green_living_roof:
    'Soil and turf over a waterproof deck insulate and slow runoff on the roof plane.',
  cross_gabled:
    'Cross-gabled plans join roof ridges at angles, breaking the silhouette for larger footprints.',
};

const OPENING_PHRASES: Record<ArchitecturalStyle['openings'], string> = {
  generous: 'Openings are broad for daylight and ventilation.',
  moderate: 'Windows and doors balance light with wall strength.',
  narrow_defensive: 'Narrow openings prioritize enclosure and watchfulness over views.',
};

const WINDOW_COUNT_PHRASES: Record<WindowingStyle['countBand'], string> = {
  sparse: 'Openings are relatively sparse on each facade',
  moderate: 'Openings repeat at a moderate density',
  rich: 'Windows are numerous, trading wall mass for daylight and views',
};

const WINDOW_ARRANGEMENT_PHRASES: Record<WindowingStyle['arrangement'], string> = {
  regular_grid: 'they follow a regular grid on each elevation',
  punched_staggered: 'they are punched in a staggered pattern to spare weak piers',
  vertical_banded_pairs: 'they group in vertical pairs or bands between structural bays',
  horizontal_ribbon: 'they run as horizontal bands or ribbons along floors',
  clerestory_row: 'they concentrate in clerestory rows under the roof line',
  courtyard_oriented: 'they favor interior courts with fewer holes on exposed walls',
  corner_towers: 'they cluster at corners and towers where sight lines matter',
};

const WINDOW_SHAPE_PHRASES: Record<WindowingStyle['shape'], string> = {
  rectangular: 'rectangular',
  segmental_arch: 'segmental arched',
  full_round: 'round or oculus-like',
  lancet: 'tall lancet or pointed',
  small_square: 'small and square',
};

const WINDOW_FILL_PHRASES: Record<WindowingStyle['fillPrimary'], string> = {
  glass_clear: 'clear glass',
  glass_leaded: 'leaded or lattice-held glass',
  paper_translucent: 'translucent paper or panel in a sliding frame',
  open_to_shutter: 'open to the weather when unshuttered, closed with wooden shutters',
  lattice_screen: 'fixed lattice or screen that admits air more than view',
  oiled_hide_or_fabric: 'oiled hide, waxed cloth, or similar flexible panel',
  mica_or_selenite: 'thin split mica or selenite panes where glass is scarce',
  woven_reed_mat: 'woven reed or grass matting',
  metal_grille_backed: 'metal grille or barwork with optional backing',
  none_louver_vent_only: 'only louvers or narrow vents—no true glazed sash',
};

const ADDITION_PHRASES: Record<BuildingAdditionKind, string> = {
  balcony: 'balconies and projecting ledges along upper floors',
  widow_walk: "railed widow's walks and small roof decks for outlook",
  roof_terrace: 'usable roof terraces for gathering or service',
  loggia: 'deep loggias that shade openings while staying open to air',
  arcade: 'ground-floor arcades sheltering walkways and shop fronts',
  oriel_window: 'oriel bays that thrust past the wall plane',
  bay_projection: 'rectangular bay windows enlarging interior rooms',
  machicolations: 'machicolated parapets for overhead defense',
  bartizan: 'bartizans and turret caps at corners',
  wall_walk: 'chemin de ronde–style wall walks behind parapets',
  flying_buttress: 'flying buttresses articulating nave walls',
  entry_canopy: 'canopies and deep hoods over principal entries',
  loading_bay_cover: 'shed roofs and canopies over loading and carts',
  drying_gallery: 'open galleries suited to drying goods or crops',
  belfry: 'belfries and open lantern stages above rooflines',
  cornice_drip_band: 'profiled cornices and drip courses shedding water from walls',
  pergola: 'pergolas and post-and-beam shade frames',
  external_stair: 'external stairs and dogleg flights on the facade',
};

function formatBuildingAddition(a: BuildingAddition): string {
  const base = ADDITION_PHRASES[a.kind];
  if (a.role === 'ornamental') {
    return `${base}, read mainly as ornament`;
  }
  if (a.role === 'functional') {
    return `${base}, driven by use rather than display`;
  }
  return `${base}, mixing use and display`;
}

function additionsParagraph(additions: BuildingAddition[]): string | null {
  if (additions.length === 0) {
    return null;
  }
  const bits = additions.map((a) => formatBuildingAddition(a));
  return `Notable projecting elements include ${bits.join('; ')}.`;
}

function windowingParagraph(windows: WindowingStyle): string {
  const count = WINDOW_COUNT_PHRASES[windows.countBand];
  const arr = WINDOW_ARRANGEMENT_PHRASES[windows.arrangement];
  const shape = WINDOW_SHAPE_PHRASES[windows.shape];
  const fill = WINDOW_FILL_PHRASES[windows.fillPrimary];
  let s = `${count}; ${arr}. Typical lights are ${shape}, primarily filled with ${fill}.`;
  if (windows.fillSecondary != null) {
    const sec = WINDOW_FILL_PHRASES[windows.fillSecondary];
    s += ` A secondary layer uses ${sec}.`;
  }
  return s;
}

const DECORATION_PHRASES: Record<string, string> = {
  carved_stone: 'Carved stone detail frames portals and corners.',
  painted_plaster: 'Plaster surfaces carry color and painted motifs.',
  tile_inlay: 'Tile bands and inlays punctuate floors and dados.',
  metalwork: 'Metal fittings and straps reinforce joints visibly.',
  wood_carving: 'Timber eaves and posts show carved relief.',
  minimal: 'Ornament stays spare; material joints read as the decoration.',
};

function purposesPhrase(purposes: ArchitecturalStyle['purposesEmphasized']): string | null {
  if (purposes.length === 0) {
    return null;
  }
  const labels: Record<string, string> = {
    residential: 'dwelling',
    defensive: 'defense',
    civic: 'public life',
    religious: 'worship',
    storage: 'storage',
    commercial: 'trade',
  };
  const parts = purposes.map((p) => labels[p] ?? p);
  if (parts.length === 1) {
    return `The brief emphasizes ${parts[0]}.`;
  }
  return `The brief mixes ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`;
}

function siteTagsPhrase(tags: string[]): string | null {
  if (tags.length === 0) {
    return null;
  }
  const readable = tags.map((t) => t.replace(/_/g, ' '));
  return `Site habits include ${readable.join('; ')}.`;
}

export function fragmentsForArchitecturalStyle(style: ArchitecturalStyle): string[] {
  const parts: string[] = [];

  parts.push(`This is a ${style.label}.`);
  parts.push(
    `Primary materials include ${style.primaryMaterials.join(' and ')}; secondary use includes ${style.secondaryMaterials.join(', ')}.`,
  );
  parts.push(STRUCTURAL_PHRASES[style.structuralSystem]);
  parts.push(MASSING_PHRASES[style.massing]);
  parts.push(ROOF_PHRASES[style.roof]);
  parts.push(OPENING_PHRASES[style.openings]);
  parts.push(windowingParagraph(style.windows));

  const addLine = additionsParagraph(style.buildingAdditions);
  if (addLine) {
    parts.push(addLine);
  }

  for (const d of style.activeDecorations) {
    const line = DECORATION_PHRASES[d];
    if (line) {
      parts.push(line);
    }
  }

  const purposeLine = purposesPhrase(style.purposesEmphasized);
  if (purposeLine) {
    parts.push(purposeLine);
  }

  const siteLine = siteTagsPhrase(style.siteAdaptations);
  if (siteLine) {
    parts.push(siteLine);
  }

  return parts;
}
