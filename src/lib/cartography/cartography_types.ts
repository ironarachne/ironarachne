import type { Vertex } from '$lib/geometry';

export type Parchment = { fill: string; grainFilterId: string; grainOpacity: number };
export type Ink = { color: string; opacity: number };
export type InkPalette = { body: Ink; secondary: Ink; text: Ink; water: Ink };
export type StrokeWeight = 'hairline' | 'fine' | 'medium' | 'heavy';
export type EdgeMethod = 'midpointDisplacement' | 'chaikin' | 'catmullRom';
export type EdgeTreatment = {
  method: EdgeMethod;
  amplitude: number;
  depth: number;
  /** Optional graph identities preserve the existing boundary jitter when rendering saved maps. */
  displace: (points: Vertex[], cornerIds?: number[]) => Vertex[];
};
export type Cartography = { ground: Parchment; palette: InkPalette; edges: EdgeTreatment };

export type InkedPath = {
  points: Vertex[];
  ink: Ink;
  weight: StrokeWeight;
  closed: boolean;
  toSvg: () => string;
};

export type Hatching = {
  shoreline: Vertex[];
  spacing: number;
  falloff: number;
  maxBands: number;
  toPaths: () => InkedPath[];
};
