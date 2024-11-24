export default interface WaterSystemConfig {
    current: number[]; // vector of current direction and speed
    latitude: number; // latitude in degrees, -90 to 90
    temperatureMin: number; // degrees Celsius
    temperatureMax: number; // degrees Celsius
    surfaceLevelMin: number; // -1 to 1, with 0 being normal sea level
    surfaceLevelMax: number; // -1 to 1, with 0 being normal sea level
    waterTypes: string[]; // list of water types (e.g., "fresh", "salt")
}