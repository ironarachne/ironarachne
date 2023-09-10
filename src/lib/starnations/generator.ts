import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import StarSystemGenerator from "../starsystem/generator.js";
import StarSystemGeneratorConfig from "../starsystem/generatorconfig.js";
import type StarNationGeneratorConfig from "./generatorconfig.js";
import StarNation from "./starnation.js";

export default class StarNationGenerator {
  config: StarNationGeneratorConfig;

  constructor(config: StarNationGeneratorConfig) {
    this.config = config;
  }

  generate(): StarNation {
    let nation = new StarNation();

    nation.government = RND.item(this.config.governmentOptions);

    let name = this.config.nameGenerator.generate(1)[0];

    nation.adjective = name + RND.item(["n", "i", "ish"]);
    nation.name = `the ${nation.government.nameGenerator.generate(1)[0]} ${name}`;

    nation.description = `${Words.title(nation.name)} is ${
      Words.article(nation.government.name)
    } ${nation.government.name}.`;

    let minSystems = Math.max(this.config.minSystems, nation.government.minSystems);
    let maxSystems = Math.max(this.config.maxSystems, nation.government.maxSystems);

    let numberOfSystems = random.int(minSystems, maxSystems);

    let systemGenConfig = new StarSystemGeneratorConfig();
    let systemGen = new StarSystemGenerator(systemGenConfig);

    let population = 0;
    let inhabitedPlanets = 0;
    let possibleCapitals = [];

    for (let i = 0; i < numberOfSystems; i++) {
      let system = systemGen.generate();
      for (let j = 0; j < system.planets.length - 1; j++) {
        if (system.planets[j].is_inhabited) {
          population += system.planets[j].population;
          inhabitedPlanets++;
          possibleCapitals.push([i, j]);
        }
      }
      nation.systems.push(system);
    }

    let capital = RND.item(possibleCapitals);

    nation.capitalSystem = capital[0];
    nation.capitalPlanet = capital[1];

    nation.primaryGoal = RND.item([
      "conquest",
      "to spread their beliefs",
      "to share their knowledge",
      "to always be learning",
      "to always make a profit",
      "to discover new worlds and new people",
      "to bring order",
      "to unite the universe",
      "to unite the universe under their rule",
      "to bring order to the universe",
      "to ever be increasing their knowledge",
      "to learn all the secrets of the universe",
    ]);

    nation.technology = RND.item([
      "highly advanced",
      "advanced",
      "comparable",
      "relatively primitive",
    ]);

    nation.military = RND.item([
      "well-funded and large",
      "poorly funded but large",
      "poorly funded and small",
      "aggressive",
      "belligerent",
      "cautious",
      "orderly",
      "well-disciplined",
    ]);

    nation.culture = RND.item([
      "fragmented",
      "homogeneous",
      "melting pot",
      "controlled",
      "decaying",
    ]);

    nation.economy = RND.item([
      "strong",
      "thriving",
      "collapsing",
      "corrupt",
      "growing",
      "shrinking",
    ]);

    nation.description += ` Its capital is ${
      nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].name
    } in the ${
      nation.systems[nation.capitalSystem].name
    } system. There are ${nation.systems.length} systems under its sway, with ${inhabitedPlanets} inhabited worlds and a total population of ${
      getFriendlyPopulation(
        population,
      )
    }.`;

    return nation;
  }
}

function getFriendlyPopulation(pop: number): string {
  const formatter = new Intl.NumberFormat();

  if (pop < 1000000.0) {
    return formatter.format(Math.floor(pop / 1000.0)) + " thousand";
  }

  if (pop < 1000000000.0) {
    return formatter.format(pop / 1000000.0) + " million";
  }

  if (pop < 1000000000000.0) {
    return formatter.format(pop / 1000000000.0) + " billion";
  }

  return formatter.format(pop / 1000000000000.0) + " trillion";
}
