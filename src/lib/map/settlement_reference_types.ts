import type { Vertex } from '$lib/geometry';
import type { TextBox } from './terrain_glyph_types';

/** Display keys are derived from saved IDs; they are never persisted as settlement identities. */
export type SettlementMapReference = {
  settlementId: string;
  key: number;
  name: string;
  site: Vertex;
  markerBounds: TextBox;
};

export type SettlementKeyPlacement = {
  settlementId: string;
  key: number;
  kind: 'adjacent' | 'gutter';
  bounds: TextBox;
  origin: Vertex;
  leader: Vertex[];
};

export type SettlementReferenceLayout = {
  references: SettlementMapReference[];
  sheetBounds: TextBox;
} & (
  | { mode: 'names'; keys: []; indexBounds?: never }
  | { mode: 'indexed'; keys: SettlementKeyPlacement[]; indexBounds: TextBox }
);
