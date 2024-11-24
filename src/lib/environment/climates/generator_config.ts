export default interface ClimateGeneratorConfig {
  elevation: number; // -1.0-1.0, 0 being sea level, -1 being the lowest possible elevation, 1 being the highest
  latitude: number; // -90-90, 0 being the equator, -90 being the south pole, 90 being the north pole
  longitude: number; // -180-180, 0 being the prime meridian, -180 being the international date line
  waterDirection: number[]; // vector representing the direction and distance to the nearest water
  current: number[]; // vector representing the direction of the water current
  temperatureAtEquator: number; // the average temperature at sea level at the equator, in degrees Celsius
  terrainNormalVector: number[]; // the "tilt" of the terrain plane
}
