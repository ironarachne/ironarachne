import type { Vertex } from '$lib/geometry';
import type { TerrainGlyphVariant, TextBox } from './terrain_glyph_types';
import type { RegionMapSvgSettlement } from './region_map_svg_types';

export type SettlementIconCategory =
  | 'hamlet'
  | 'village'
  | 'town'
  | 'borough'
  | 'city'
  | 'metropolis';
export type SettlementBuildingKind = 'cottage' | 'hall' | 'tower';
export type SettlementIconProfile = {
  category: SettlementIconCategory;
  buildingKinds: SettlementBuildingKind[];
  targetHalfWidthFactor: number;
  slots: Vertex[];
};
export type SettlementBuildingVariant = {
  id: string;
  kind: SettlementBuildingKind;
  artwork: TerrainGlyphVariant;
};
export type SettlementIconBuilding = {
  variantId: string;
  anchor: Vertex;
  scale: number;
  slotIndex: number;
};
export type SettlementIcon = {
  category: SettlementIconCategory;
  buildings: SettlementIconBuilding[];
  isCapital: boolean;
  bounds: TextBox;
};
export type PlacedSettlementIcon = {
  settlement: RegionMapSvgSettlement;
  icon: SettlementIcon;
  anchor: Vertex;
  scale: number;
  bounds: TextBox;
};
