import type { DensityCategory, Item } from "$lib/equipment";

export type ArtObject = Item & {
  artist: string;
}

export type ArtObjectType = {
  name: string;
  baseValue: number;
  baseWeight: number;
  densityCategory: DensityCategory;
  materialCategory?: string[];
}

export type ArtObjectGeneratorConfig = {
  allowedTypes?: ArtObjectType[];
  minimumValue?: number;
  maximumValue?: number;
}
