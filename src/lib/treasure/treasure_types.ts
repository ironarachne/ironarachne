import type { ContainerType, DensityCategory, Item } from '$lib/equipment/equipment_types';

export type ArtObject = Item & {
  artist: string;
}

export type ArtObjectType = {
  name: string;
  baseValue: number;
  baseWeight: number;
  densityCategory: DensityCategory;
}

export type TreasureHoardGeneratorConfig = {
  allowedContainerTypes?: ContainerType[];
  artObjectProportion: number;
  coinProportions: { [denomination: string]: number };
  gemProportion: number;
  roomDimensions?: { width: number; length: number; height: number; };
  targetValue: number;
}
