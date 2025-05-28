import { getAlbedoFromTemperature, getGravityFromMassAndRadius, getPlanetTemperature, type AstronomicalBody } from "../astronomical_bodies";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import { getStandardMoonClassifications } from "./moon_classifications";
import random from "random";

export type MoonClassification = {
    name: string;
    description: string;
    has_atmosphere: boolean;
    orbital_distance_min: number;
    orbital_distance_max: number;
    orbital_period_min: number;
    orbital_period_max: number;
    radius_min: number;
    radius_max: number;
    surface_pressure_min: number;
    surface_pressure_max: number;
    mass_min: number;
    mass_max: number;
    getRandomDescription(): string;
}

export type MoonGenerationConfig = {
    possible_classifications: MoonClassification[];
    star_temperature: number;
    habitable_chance: number;
    parent_orbital_distance: number; // Parent body's orbital distance from the star in AU
    parent_mass: number; // Parent body's mass in 10^24 kg
    parent_radius: number; // Parent body's radius in km
}

export function generateMoon(config: MoonGenerationConfig): AstronomicalBody {
    const name = MUN.planet(); // Using planet name generator for moons

    const classification = RND.item(config.possible_classifications);
    const radius_min = classification.radius_min * config.parent_radius / 6371; // Scale radius based on Earth's radius
    const radius_max = classification.radius_max * config.parent_radius / 6371; // Scale radius based on Earth's radius
    const mass_min = classification.mass_min * config.parent_mass / 5.972; // Scale mass based on Earth's mass
    const mass_max = classification.mass_max * config.parent_mass / 5.972; // Scale mass based on Earth's mass
    const orbital_distance_min = classification.orbital_distance_min * config.parent_orbital_distance; // Scale orbital distance based on parent's distance
    const orbital_distance_max = classification.orbital_distance_max * config.parent_orbital_distance; // Scale orbital distance based on parent's distance

    const radius = random.float(radius_min, radius_max);
    const mass = random.float(mass_min, mass_max);
    const orbital_distance = random.float(orbital_distance_min, orbital_distance_max);
    const orbital_period = random.int(classification.orbital_period_min, classification.orbital_period_max);
    const description = classification.getRandomDescription();
    const surface_pressure = classification.has_atmosphere ? Math.random() * (classification.surface_pressure_max - classification.surface_pressure_min) + classification.surface_pressure_min : 0;
    const temperature = getPlanetTemperature(surface_pressure, config.parent_orbital_distance, config.star_temperature);
    const rotation_period = getRotationPeriod(orbital_period, orbital_distance);

    return {
        name: name,
        description: description,
        albedo: getAlbedoFromTemperature(temperature),
        axis_of_rotation: Math.random() * 360,
        classification: `${classification.name} moon`,
        gravity: getGravityFromMassAndRadius(mass, radius),
        has_atmosphere: classification.has_atmosphere,
        has_ring_system: false, // Moons typically do not have ring systems
        luminosity: 0,
        mass: mass,
        orbital_distance: orbital_distance,
        orbital_period: orbital_period,
        radius: radius,
        rotation_period: rotation_period,
        surface_pressure: surface_pressure,
        surface_temperature: temperature,
    };
}

export function getDefaultMoonGenerationConfig(): MoonGenerationConfig {
    return {
        possible_classifications: getStandardMoonClassifications(), // by default, use standard classifications
        star_temperature: 5778, // Average temperature of the Sun in Kelvin
        habitable_chance: 10, // 10% chance for a moon to be habitable
        parent_orbital_distance: 1, // Assuming the parent body is at 1 AU from the star
        parent_mass: 5.972, // Mass of Earth in 10^24 kg
        parent_radius: 6371, // Radius of Earth in km
    };
}

export function getNumberOfMoonsForParent(parent: AstronomicalBody): number {
    // This function can be customized based on the parent body's characteristics
    // For simplicity, we return a random number of moons between 1 and 5
    if (parent.classification.includes("gas giant")) {
        // Gas giants tend to have more moons
        return random.int(5, 20);
    }
    return random.int(1, 5);
}

export function getRotationPeriod(orbital_period: number, distance_from_parent: number): number {
    let rotation_period = orbital_period;

    // As distance increases, tidal locking becomes much less likely
    if (distance_from_parent > 0.1) {
        // For moons further than 0.1 AU, we can assume they are not tidally locked
        rotation_period = random.int(orbital_period, orbital_period * 2);
    }
    return rotation_period;
}