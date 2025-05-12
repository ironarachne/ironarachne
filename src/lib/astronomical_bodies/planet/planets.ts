import {
  type AstronomicalBody,
  getAlbedoFromTemperature, getGravityFromMassAndRadius,
  getPlanetTemperature,
} from '$lib/astronomical_bodies/astronomical_bodies';
import { getPlanetClassifications } from './planet_classifications';
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";

export type PlanetClassification = {
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

export type PlanetGenerationConfig = {
  possible_classifications: PlanetClassification[];
  rings_chance: number;
  starport_chance: number;
  star_temperature: number;
  habitable_chance: number;
}

export function generatePlanet(config: PlanetGenerationConfig): AstronomicalBody {
  const name = MUN.planet();

  const classification = RND.item(config.possible_classifications);
  const radius = random.float(classification.radius_min, classification.radius_max);
  const has_rings = random.int(0, 100) < config.rings_chance;
  const mass = random.float(classification.mass_min, classification.mass_max);
  const orbital_distance = random.float(classification.orbital_distance_min, classification.orbital_distance_max);
  const orbital_period = random.float(classification.orbital_period_min, classification.orbital_period_max);
  const description = classification.getRandomDescription();
  const surface_pressure = classification.has_atmosphere ? RND.bellFloat(classification.surface_pressure_min, classification.surface_pressure_max) : 0;
  const temperature = getPlanetTemperature(surface_pressure, orbital_distance, config.star_temperature);

  return {
    name: name,
    description: description,
    albedo: getAlbedoFromTemperature(temperature),
    axis_of_rotation: random.float(0, 360),
    classification: `${classification.name} planet`,
    gravity: getGravityFromMassAndRadius(mass, radius),
    has_atmosphere: classification.has_atmosphere,
    has_ring_system: has_rings,
    luminosity: 0,
    mass: mass,
    orbital_distance: orbital_distance,
    orbital_period: orbital_period,
    radius: radius,
    rotation_period: random.int(16, 36), // TODO: Make a more interesting rotation period
    surface_pressure: surface_pressure,
    surface_temperature: temperature,
  }
}

export function getDefaultPlanetGenerationConfig(): PlanetGenerationConfig {
  return {
    possible_classifications: getPlanetClassifications(),
    rings_chance: 5,
    starport_chance: 85,
    star_temperature: 5773, // default to the Sun's temperature
    habitable_chance: 60,
  }
}
