import type WaterSystem from "./water_system";
import type WaterSystemConfig from "./water_system_config";
import * as RND from "@ironarachne/rng";
import random from "random";

export function generate(config: WaterSystemConfig): WaterSystem {
    // Generate a temperature based on latitude
    // At latitude 0, the temperature is always the max temperature
    // At latitude -90 or 90, the temperature is always the min temperature
    const latitudeFactor = Math.abs(config.latitude) / 90;
    const temperature = config.temperatureMin + (config.temperatureMax - config.temperatureMin) * latitudeFactor;

    return {
        current: config.current,
        surfaceLevel: random.float(config.surfaceLevelMin, config.surfaceLevelMax),
        temperature,
        waterType: RND.item(config.waterTypes),
    };
}

export function getDefaultConfig(): WaterSystemConfig {
    return {
        current: [0, 0, 0],
        latitude: 0,
        temperatureMin: 0, // default to polar
        temperatureMax: 30, // default to tropical
        surfaceLevelMin: 0, // default to sea level
        surfaceLevelMax: 0, // default to sea level
        waterTypes: ["fresh", "salt"],
    };
}