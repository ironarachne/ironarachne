import { getStarClassifications } from "$lib/astronomical_bodies/star/star_classifications";
import {
  type AstronomicalBody,
  getAlbedoFromTemperature,
} from "$lib/astronomical_bodies/astronomical_bodies";
import { getGravityFromMassAndRadius } from "$lib/astronomical_bodies/astronomical_bodies";
import * as MUN from "@ironarachne/made-up-names";
import * as RNG from "@ironarachne/rng";
import * as Words from "@ironarachne/words";

export type StarClassification = {
  name: string;
  description: string;
  luminosity_class: string;
  spectral_class: string;
  min_mass: number; // in solar masses
  max_mass: number; // in solar masses
  min_radius: number; // in solar radii
  max_radius: number; // in solar radii
  min_temperature: number; // in Kelvin
  max_temperature: number; // in Kelvin
  min_luminosity: number; // in solar luminosities
  max_luminosity: number; // in solar luminosities
  commonality: number;
};

export type LuminosityClass = {
  name: string;
  description: string;
  min_mass: number; // in solar masses
  max_mass: number; // in solar masses
  min_radius: number; // in solar radii
  max_radius: number; // in solar radii
  min_luminosity: number; // in solar luminosities
  max_luminosity: number; // in solar luminosities
  commonality: number;
};

export type SpectralClass = {
  name: string;
  spectral_class: string;
  min_temperature: number; // in Kelvin
  max_temperature: number; // in Kelvin
  commonality: number;
};

export type StarGenerationConfig = {
  star_classifications: StarClassification[];
  rng: RNG.RNG;
};

export function getDefaultStarGeneratorConfig(): StarGenerationConfig {
  return {
    star_classifications: getStarClassifications(),
    rng: new RNG.RNG(Date.now().toString()),
  };
}

export function generateStar(config: StarGenerationConfig): AstronomicalBody {
  const star_classification = config.rng.weighted(config.star_classifications);
  const mass: number = config.rng.float(
    star_classification.min_mass,
    star_classification.max_mass,
  );
  const radius: number =
    config.rng.float(star_classification.min_radius, star_classification.max_radius) *
    695700; // in km
  const gravity = getGravityFromMassAndRadius(mass, radius);
  const temperature = config.rng.float(
    star_classification.min_temperature,
    star_classification.max_temperature,
  );

  return {
    name: MUN.getStarNameGenerator(config.rng).generate(1)[0],
    description: `This is ${Words.article(star_classification.description)} ${star_classification.description} star.`,
    albedo: getAlbedoFromTemperature(temperature),
    axis_of_rotation: config.rng.float(0, 360),
    classification: star_classification.name,
    gravity: gravity,
    has_atmosphere: true,
    has_ring_system: false,
    luminosity: config.rng.float(
      star_classification.min_luminosity,
      star_classification.max_luminosity,
    ),
    mass: mass,
    orbital_distance: 0, // the star is not orbiting anything that we measure
    orbital_period: 0, // as above
    radius: radius,
    rotation_period: RNG.int(15, 60), // simulating true rotational period for stars is complicated, so we're cheating here
    surface_pressure: gravity ** 2,
    surface_temperature: temperature,
  };
}
