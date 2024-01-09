import * as Planets from "$lib/planets/planets";
import * as Words from "@ironarachne/words";
import * as RND from "@ironarachne/rng";
import random from "random";
import PlanetGeneratorConfig from "$lib/planets/planet_generator_config";
import StarGenerator from "$lib/stars/generator";
import StarGeneratorConfig from "$lib/stars/generatorconfig";
import type StarSystemGeneratorConfig from "./generatorconfig";
import type StarSystem from "./star_system";

export default class StarSystemGenerator {
  config: StarSystemGeneratorConfig;

  constructor(config: StarSystemGeneratorConfig) {
    this.config = config;
  }

  generate() {
    const starsystem: StarSystem = {
      name: "",
      description: "",
      stars: [],
      planets: [],
    };

    const starGenConfig = new StarGeneratorConfig();
    const starGen = new StarGenerator(starGenConfig);

    const star = starGen.generate();

    starsystem.name = star.name;

    starsystem.stars.push(star);

    // TODO: binary and trinary systems

    const numberOfPlanets = random.int(
      this.config.minPlanets,
      this.config.maxPlanets,
    );

    const planetGenConfig = new PlanetGeneratorConfig();

    for (let i = 0; i < numberOfPlanets; i++) {
      const planet = Planets.generate(planetGenConfig);
      starsystem.planets.push(planet);
    }

    starsystem.planets.sort((x, y) => {
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
        starsystem.planets[i].name = `${starsystem.name} ${Words.romanize(
          i + 1,
        )}`;
      }
    }

    starsystem.description = `The ${starsystem.name} system has ${numberOfPlanets} planets`;

    const asteroidBeltChance = RND.simple(100);

    if (asteroidBeltChance > 70) {
      starsystem.description += " and an asteroid belt.";
    } else {
      starsystem.description += ".";
    }

    return starsystem;
  }
}
