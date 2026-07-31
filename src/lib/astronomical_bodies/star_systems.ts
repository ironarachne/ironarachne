import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import { getPlanetClassifications } from './planet/planet_classifications';
import {
  generatePlanet,
  getDefaultPlanetGenerationConfig,
  type PlanetClassification,
} from './planet/planets';
import { getStarClassifications } from './star/star_classifications';
import { generateStar, getDefaultStarGeneratorConfig, type StarClassification } from './star/stars';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

export type StarSystem = {
  name: string;
  description: string;
  star_count: number;
  planet_count: number;
  stars: Array<AstronomicalBody>;
  planets: Array<AstronomicalBody>;
};

export type StarSystemGenerationConfig = {
  star_count: number;
  planet_count: number;
  star_classifications: Array<StarClassification>;
  planet_classifications: Array<PlanetClassification>;
  rng: RNG.RNG;
};

export function getDefaultStarSystemGeneratorConfig(): StarSystemGenerationConfig {
  const rng = new RNG.RNG(Date.now().toString());

  return {
    star_count: 1,
    planet_count: Math.round(rng.bellFloat(1, 12)),
    star_classifications: getStarClassifications(),
    planet_classifications: getPlanetClassifications(),
    rng: rng,
  };
}

export function generateStarSystem(config: StarSystemGenerationConfig): StarSystem {
  const stars = [];
  const star_config = getDefaultStarGeneratorConfig();
  star_config.star_classifications = config.star_classifications;
  star_config.rng = config.rng;

  for (let i = 0; i < config.star_count; i++) {
    const star = generateStar(star_config);

    if (config.star_count > 1) {
      star.name = `${star.name} ${i + 1}`;
    }

    stars.push(star);
  }

  const planets = [];
  const planet_config = getDefaultPlanetGenerationConfig();
  planet_config.rng = config.rng;
  planet_config.possible_classifications = config.planet_classifications;

  for (let i = 0; i < config.planet_count; i++) {
    const planet = generatePlanet(planet_config);
    planets.push(planet);
  }

  planets.sort((x, y) => {
    if (x.orbital_distance < y.orbital_distance) {
      return -1;
    }
    if (x.orbital_distance > y.orbital_distance) {
      return 1;
    }
    return 0;
  });

  const system_name = `${stars[0].name}`;

  for (let i = 0; i < planets.length; i++) {
    const is_inhabited = config.rng.simple(100) < 10;
    if (!is_inhabited) {
      planets[i].name = `${system_name} ${Words.romanize(i + 1)}`;
    }
  }

  const description = `A star system with ${stars.length} stars and ${planets.length} planets.`;
  const star_count = stars.length;
  const planet_count = planets.length;

  return {
    name: system_name,
    description,
    star_count,
    planet_count,
    stars,
    planets,
  };
}
