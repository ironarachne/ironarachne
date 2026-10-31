import type { Biome, Climate } from '$lib/environment';
import type { BuildingStructuralAffordance, Resource, ResourceAvailability } from '$lib/resources';
import type {
  SiteRelief,
  SiteSubstrate,
  WindowArrangement,
  WindowShape,
  MassingStyle,
} from './architectural_style_types';

export type ResourceKnowledge = 'known' | 'unknown';
export type MaterialOrigin = 'local' | 'imported' | 'salvaged' | 'native';
export type ConstructionKind = 'built' | 'rock_cut' | 'natural';
export type Exposure = 'exposed' | 'sheltered' | 'buried';
export type ArchitecturalPurpose =
  | 'residential'
  | 'defensive'
  | 'civic'
  | 'religious'
  | 'storage'
  | 'commercial'
  | 'funerary'
  | 'scholarly'
  | 'industrial'
  | 'circulation'
  | 'natural';
export type DensityBand = 'low' | 'medium' | 'high';
export type MotifKind = 'none' | 'geometric' | 'interlace' | 'floral' | 'figurative';
export type MaterialFamily =
  | 'wood'
  | 'stone'
  | 'earth'
  | 'ceramic'
  | 'plant'
  | 'metal'
  | 'mineral'
  | 'glass'
  | 'fabric'
  | 'other';
export type MaterialForm =
  | 'timber'
  | 'pole'
  | 'block'
  | 'brick'
  | 'compacted_earth'
  | 'tile'
  | 'slab'
  | 'board'
  | 'thatch'
  | 'plaster'
  | 'sheet'
  | 'pane'
  | 'woven'
  | 'bar'
  | 'native_rock'
  | 'unknown';
export type MaterialRole =
  | 'structure'
  | 'enclosure'
  | 'roof_covering'
  | 'floor'
  | 'finish'
  | 'window_fill'
  | 'door_leaf'
  | 'ornament';
export type ArchitecturalSite = {
  substrate: SiteSubstrate | null;
  relief: SiteRelief | null;
  coastal: boolean | null;
  floodProne: boolean | null;
};
export type ArchitectureResourceInput = {
  id: string;
  resource: Resource;
  form: MaterialForm;
  availability: ResourceAvailability;
  origin: MaterialOrigin;
  evidenceIds: string[];
};
export type ArchitectureResources =
  | { knowledge: 'known'; entries: ArchitectureResourceInput[] }
  | { knowledge: 'unknown'; entries: [] };
export type ArchitectureContext = {
  id: string;
  construction: ConstructionKind;
  exposure: Exposure;
  purpose: ArchitecturalPurpose;
  density: DensityBand | null;
  exteriorWindowsAllowed: boolean;
};
export type CulturalPreference = { id: string; motif: MotifKind; weight: number };
export type GenerateArchitecturalStyleConfig = {
  seed: string;
  biome: Biome;
  climate?: Climate;
  site: ArchitecturalSite;
  resources: ArchitectureResources;
  contexts: ArchitectureContext[];
  culturalPreferences: CulturalPreference[];
};
export type ArchitectureOrigin = {
  biomeName: string;
  temperature: number;
  humidity: number;
  altitude: number;
  isAquatic: boolean;
  climate?: Climate;
  site: ArchitecturalSite;
  resourceKnowledge: ResourceKnowledge;
  inputFingerprint: string;
};
export type ArchitecturalMaterial = {
  id: string;
  label: string;
  family: MaterialFamily;
  form: MaterialForm;
  roles: MaterialRole[];
  affordance: BuildingStructuralAffordance;
  availability: ResourceAvailability;
  origin: MaterialOrigin;
  evidenceIds: string[];
};
export type StructuralSystem =
  | 'post_and_beam'
  | 'load_bearing_masonry'
  | 'cob_or_adobe'
  | 'hybrid_timber_and_masonry'
  | 'excavated_rock'
  | 'unworked';
export type SurfaceRole = 'outer_wall' | 'inner_wall' | 'floor' | 'ceiling';
export type SurfaceFinish =
  | 'unworked'
  | 'rough_cut'
  | 'dressed'
  | 'smooth'
  | 'plastered'
  | 'painted'
  | 'tiled';
export type SurfaceTreatment = {
  role: SurfaceRole;
  materialId: string | null;
  finish: SurfaceFinish;
  finishMaterialId: string | null;
};
export type RoofForm =
  | 'flat'
  | 'shed'
  | 'gable'
  | 'hip'
  | 'gambrel'
  | 'mansard'
  | 'cross_gable'
  | 'dome'
  | 'barrel';
export type RoofPitch = 'low' | 'moderate' | 'steep';
export type EaveKind = 'none' | 'short' | 'deep';
export type RoofTreatment = {
  form: RoofForm;
  pitch: RoofPitch;
  coveringMaterialId: string;
  structureMaterialId: string;
  eaves: EaveKind;
};
export type WindowFill = 'open' | 'shuttered' | 'lattice' | 'glazed' | 'membrane' | 'grille';
export type WindowTreatment = {
  count: 'sparse' | 'moderate' | 'rich';
  arrangement: WindowArrangement;
  shape: WindowShape;
  fill: WindowFill;
  fillMaterialId: string | null;
  shutterMaterialId: string | null;
};
export type CeilingForm =
  | 'flat'
  | 'beamed'
  | 'barrel_vault'
  | 'groin_vault'
  | 'dome'
  | 'carved_flat'
  | 'carved_vault'
  | 'natural';
export type SupportKind = 'none' | 'timber_posts' | 'piers' | 'columns' | 'rock_pillars';
export type NumberRange = { min: number; max: number };
export type IntegerRange = NumberRange;
export type ProportionRange = {
  storeys: IntegerRange | null;
  widthDepthRatio: NumberRange | null;
  wallHeightWidthRatio: NumberRange;
};
export type FeatureKind =
  | import('./architectural_style_types').BuildingAdditionKind
  | 'stone_carving'
  | 'wood_carving'
  | 'tile_inlay'
  | 'metal_fittings'
  | 'ventilation_shaft'
  | 'drain_channel'
  | 'raised_plinth'
  | 'terraced_foundation'
  | 'deep_reveal';
export type ArchitecturalFeature = {
  id: string;
  kind: FeatureKind;
  materialId: string | null;
  evidenceIds: string[];
};
export type ArchitecturalVariant = {
  id: string;
  surfaces: SurfaceTreatment[];
  roof: RoofTreatment | null;
  windows: WindowTreatment | null;
  supports: SupportKind;
  supportMaterialId: string | null;
  ceiling: CeilingForm;
  massing: MassingStyle | null;
  proportions: ProportionRange;
  features: ArchitecturalFeature[];
};
export type PortalForm = 'rectangular' | 'round_arch' | 'pointed_arch' | 'rough_cut' | 'natural';
export type ArchitecturalProfile = {
  id: string;
  context: ArchitectureContext;
  primaryMaterialId: string | null;
  structure: StructuralSystem;
  motif: MotifKind;
  portals: PortalForm[];
  frameMaterialIds: string[];
  leafMaterialIds: string[];
  variants: ArchitecturalVariant[];
};
export type ArchitecturalStyle = {
  schemaVersion: 1;
  generatorVersion: 1;
  id: string;
  seed: string;
  origin: ArchitectureOrigin;
  materials: ArchitecturalMaterial[];
  profiles: ArchitecturalProfile[];
};
export type SubjectShape = 'free' | 'rectangular' | 'circular' | 'angled' | 'irregular';
export type ConditionKind = 'unspecified' | 'intact' | 'worn' | 'ruined';
export type ConnectionKind = 'door' | 'passage' | 'stair';
export type ConnectionRequest = { id: string; kind: ConnectionKind };
export type ConnectionTreatment = {
  connectionId: string;
  portal: PortalForm;
  frameMaterialId: string | null;
  leafMaterialId: string | null;
  finish: SurfaceFinish;
};
export type ArchitectureSubject = {
  id: string;
  profileId: string;
  currentPurpose: ArchitecturalPurpose;
  shape: SubjectShape;
  widthDepthRatio: number | null;
  condition: ConditionKind;
  placedFeatureIds: string[];
  connections: ConnectionRequest[];
};
export type ArchitecturalInstance = {
  id: string;
  profileId: string;
  variantId: string;
  currentPurpose: ArchitecturalPurpose;
  storeys: number | null;
  widthDepthRatio: number | null;
  wallHeightWidthRatio: number;
  condition: ConditionKind;
  placedFeatureIds: string[];
  connections: ConnectionTreatment[];
};
export type DiagnosticCode =
  | 'invalid_input'
  | 'unknown_resources'
  | 'insufficient_resources'
  | 'unknown_material_form'
  | 'unsupported_context'
  | 'unsupported_feature';
export type ArchitectureDiagnostic = {
  code: DiagnosticCode;
  contextId: string | null;
  resourceIds: string[];
};
export type ArchitectureResult =
  | {
      status: 'complete' | 'partial';
      style: ArchitecturalStyle;
      diagnostics: ArchitectureDiagnostic[];
    }
  | { status: 'unavailable' | 'invalid'; style: null; diagnostics: ArchitectureDiagnostic[] };
export type ArchitectureInstanceResult =
  | { ok: true; value: ArchitecturalInstance }
  | { ok: false; diagnostics: ArchitectureDiagnostic[] };
export type ArchitectureValidation =
  | { ok: true }
  | { ok: false; diagnostics: ArchitectureDiagnostic[] };
export type ArchitectureState =
  | {
      kind: 'legacy';
      style: null;
      examples: [];
      summary: null;
      diagnostics: [];
    }
  | {
      kind: 'unavailable';
      style: null;
      examples: [];
      summary: string | null;
      diagnostics: ArchitectureDiagnostic[];
    }
  | {
      kind: 'generated' | 'partial';
      style: ArchitecturalStyle;
      examples: ArchitecturalInstance[];
      summary: string | null;
      diagnostics: ArchitectureDiagnostic[];
    };

export type ArchitectureOptions = {
  resources: ArchitectureResources;
  site?: ArchitecturalSite;
  culturalPreferences?: CulturalPreference[];
  contexts?: ArchitectureContext[];
  roomProfiles?: Record<string, string>;
};
