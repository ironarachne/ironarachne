import type { Vertex } from '$lib/geometry';
import type { TextBox } from './terrain_glyph_types';

export type MapTextCase = 'normal' | 'smallCaps';
export type MapTextAnchor = 'start' | 'middle' | 'end';
export type MapTextStyle = {
  letterCase: MapTextCase;
  italic: boolean;
  fontSize: number;
  trackingEms: number;
  haloEms: number;
  clearanceEms: number;
};
export type MapTextRun = { text: string; fontSize: number };
export type MapStraightBaseline = { kind: 'straight'; origin: Vertex; anchor: MapTextAnchor };
export type MapArcBaseline = { kind: 'arc'; start: Vertex; control: Vertex; end: Vertex };
export type MapTextBaseline = MapStraightBaseline | MapArcBaseline;
export type PlacedMapInscription = {
  id: string;
  originalText: string;
  style: MapTextStyle;
  runs: MapTextRun[];
  baseline: MapTextBaseline;
  bounds: TextBox;
};
export type MapScrollLayout = {
  bodyPath: string;
  foldPaths: string[];
  bounds: TextBox;
  title: PlacedMapInscription;
};

/** Actual visible centerlines collected while drawing rivers, including mouth reconciliation. */
export type MapLabelReach = {
  id: string;
  edgeId: number;
  from: string;
  to: string;
  points: Vertex[];
};
