export type LandformType = {
  name: string;
  description: string;
  majorType: string;
  elevationMin: number; // the minimum elevation at which this landform type can be found, -1.0-1.0
  elevationMax: number; // the maximum elevation at which this landform type can be found, -1.0-1.0
  grade: number; // the "steepness" of the landform, 0.0-1.0
  validSoils?: string[]; // soils where this landform can appear
  validRocks?: string[]; // rocks where this landform can appear
};
