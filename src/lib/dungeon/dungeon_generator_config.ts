import type Biome from "../environment/biomes/biome.js";

export default interface DungeonGeneratorConfig {
  possibleBiomes: Biome[];
  width: number; // cells
  height: number; // cells
  maxRooms: number;
  minRooms: number;
  minThreatLevel: number;
  maxThreatLevel: number;
}
