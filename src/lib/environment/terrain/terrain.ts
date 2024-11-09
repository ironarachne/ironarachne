export default interface Terrain {
  elevationMin: number; // -1.0-1.0, 0 being sea level, -1 being the lowest possible elevation, 1 being the highest
  elevationMax: number; // -1.0-1.0, 0 being sea level, -1 being the lowest possible elevation, 1 being the highest
  reliefEnergy: number; // 0.0-1.0, 0 being flat, 1 being very rough
  normalVector: number[]; // the "tilt" of the terrain plane
  landforms: string[]; // the landforms present in this terrain
}
