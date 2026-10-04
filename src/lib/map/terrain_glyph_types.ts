import type { Vertex } from '$lib/geometry';
import type { LandformClass } from './region_terrain';

export type TerrainGlyphFamily =
  | 'mountainHigh'
  | 'mountain'
  | 'hill'
  | 'treeDeciduous'
  | 'treeConifer'
  | 'treePalm'
  | 'marsh'
  | 'prairie'
  | 'desertDune'
  | 'desertRock'
  | 'desertCactus'
  | 'desertOasis';

export interface CubicInkSegment {
  start: Vertex;
  control1: Vertex;
  control2: Vertex;
  end: Vertex;
}

export interface GlyphInkStroke {
  segments: CubicInkSegment[];
  peakWidth: number;
  taperPower: number;
}

export interface TerrainGlyphVariant {
  id: string;
  bodyPaths: string[];
  strokes: GlyphInkStroke[];
  footprint: Vertex[];
}

export interface TerrainGlyphDefinition {
  family: TerrainGlyphFamily;
  variants: TerrainGlyphVariant[];
  scaleFactor: number;
  minimumScaleRatio: number;
  rotationLimitDegrees: number;
  densityRatio: number;
  candidateSpacingFactor: number;
}

export interface TerrainGlyphAssignment {
  nodeId: number;
  landform: LandformClass;
  family: TerrainGlyphFamily;
}

export interface TextBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface PlacedTerrainGlyph {
  nodeId: number;
  variantId: string;
  anchor: Vertex;
  scale: number;
  rotationDegrees: number;
  bounds: TextBox;
}

/** Integer coordinates used to author the map-local glyph sketches. */
export type SketchPoint = readonly [number, number];
