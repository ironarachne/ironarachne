export type TerrainToneFamily =
  | 'land'
  | 'water'
  | 'tundra'
  | 'desert'
  | 'coniferForest'
  | 'deciduousForest';

export type TerrainToneColor = { red: number; green: number; blue: number };
export type TerrainTone = {
  nodeId: number;
  family: TerrainToneFamily;
  color: TerrainToneColor;
};
export type TerrainToneLayer = {
  tones: TerrainTone[];
  blurRadius: number;
  opacity: number;
};
