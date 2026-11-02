import type { ArchitectureState } from '$lib/architecture';
import type { Biome, Environment } from '$lib/environment';
import type { SettlementCategory } from '$lib/settlements';

export type PanoramaInput = {
  name: string;
  category: SettlementCategory;
  population: number;
  biome: Biome;
  terrain: Environment['terrain'];
  architecture: ArchitectureState;
};
export type LandscapeKind =
  | 'woodland'
  | 'grassland'
  | 'desert'
  | 'wetland'
  | 'coastal'
  | 'cold'
  | 'highland'
  | 'neutral';
export type PlantKind =
  | 'broadleaf'
  | 'conifer'
  | 'tropical'
  | 'grass'
  | 'reed'
  | 'cactus'
  | 'palm'
  | 'scrub'
  | 'none';
export type PanoramaProfile = {
  landscape: LandscapeKind;
  vegetation: PlantKind;
  vegetationDensity: number;
  buildingCount: number;
  settlementSpread: number;
};
export type LayerKind = 'sky' | 'background' | 'terrain' | 'settlement' | 'foreground';
export type InkRole = 'body' | 'secondary' | 'water' | 'none';
export type FillRole = 'paper' | 'light' | 'shade' | 'none';
export type ScenePath = {
  d: string;
  ink: InkRole;
  fill: FillRole;
  strokeWidth: number;
  opacity: number;
};
export type PanoramaLayer = { kind: LayerKind; paths: ScenePath[] };
export type BuildingPlacement = {
  exampleId: string;
  x: number;
  y: number;
  scale: number;
  paths: ScenePath[];
};
export type PanoramaScene = {
  version: number;
  width: number;
  height: number;
  layers: PanoramaLayer[];
  buildings: BuildingPlacement[];
};
export type PlantProduction = { symbol: string; replacement: string; weight: number };
export type PlantGrammar = {
  kind: PlantKind;
  axiom: string;
  productions: PlantProduction[];
  iterations: number;
  angle: number;
  stepScale: number;
  symbolLimit: number;
};
export type PlantPlacement = { kind: PlantKind; x: number; y: number; scale: number };
