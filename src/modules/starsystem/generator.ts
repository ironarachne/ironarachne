'use strict';

import StarGenerator from '../stars/generator';
import StarGeneratorConfig from '../stars/generatorconfig';
import StarSystemGeneratorConfig from './generatorconfig';
import random from 'random';
import PlanetGeneratorConfig from '../planets/generatorconfig';
import PlanetGenerator from '../planets/generator';
import * as Words from '../words';
import StarSystem from './starsystem';

export default class StarSystemGenerator {
  config: StarSystemGeneratorConfig;

  constructor(config: StarSystemGeneratorConfig) {
    this.config = config;
  }

  generate() {
    let starsystem = new StarSystem();

    let starGenConfig = new StarGeneratorConfig();
    let starGen = new StarGenerator(starGenConfig);

    const star = starGen.generate();

    starsystem.name = star.name;

    starsystem.stars.push(star);

    // TODO: binary and trinary systems

    const numberOfPlanets = random.int(this.config.minPlanets, this.config.maxPlanets);

    let planetGenConfig = new PlanetGeneratorConfig();
    let planetGenerator = new PlanetGenerator(planetGenConfig);

    for (let i = 0; i < numberOfPlanets; i++) {
      const planet = planetGenerator.generate();
      starsystem.planets.push(planet);
    }

    starsystem.planets.sort(function (x, y) {
      if (x.distance_from_sun < y.distance_from_sun) {
        return -1;
      }
      if (x.distance_from_sun > y.distance_from_sun) {
        return 1;
      }
      return 0;
    });

    for (let i = 0; i < starsystem.planets.length; i++) {
      if (!starsystem.planets[i].is_inhabited) {
        starsystem.planets[i].name = starsystem.name + ' ' + Words.romanize(i + 1);
      }
    }

    starsystem.description = `The ${starsystem.name} system has ${numberOfPlanets} planets`;

    const asteroidBeltChance = random.int(1, 100);

    if (asteroidBeltChance > 70) {
      starsystem.description += ' and an asteroid belt.';
    } else {
      starsystem.description += '.';
    }

    return starsystem;
  }
}
