import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import * as Classifications from "./classifications.js";
import * as Culture from "./culture.js";
import PlanetGeneratorConfig from "./generatorconfig.js";
import * as Government from "./government.js";
import Planet from "./planet.js";

export default class PlanetGenerator {
  config: PlanetGeneratorConfig;

  constructor(config: PlanetGeneratorConfig) {
    this.config = config;
  }

  generate() {
    const classification = RND.item(this.config.possibleClassifications);

    let planet = new Planet();
    planet.name = MUN.planet();
    planet.classification = classification;
    planet.mass = RND.bellFloat(classification.mass_min, classification.mass_max);
    planet.diameter = RND.bellFloat(classification.diameter_min, classification.diameter_max);
    planet.orbital_period = RND.bellFloat(
      classification.orbital_period_min,
      classification.orbital_period_max,
    );
    planet.distance_from_sun = RND.bellFloat(
      classification.distance_from_sun_min,
      classification.distance_from_sun_max,
    );
    planet.gravity = calculateGravity(planet.diameter * 1000, planet.mass * Math.pow(10, 24));
    planet.has_clouds = classification.has_clouds;
    planet.has_atmosphere = classification.has_atmosphere;

    if (classification.is_inhabitable) {
      const chance = random.int(1, 100);
      if (chance > 60) {
        planet.is_inhabited = true;
      }
    }

    planet.description += RND.item(Classifications.getHazardsForClassification(classification));

    if (planet.is_inhabited) {
      planet.population = randomPopulation();
      planet.populationFriendly = getFriendlyPopulation(planet.population);
      planet.culture = Culture.generate();
      planet.government = Government.generate();

      const chanceOfStarport = random.int(1, 100);

      if (chanceOfStarport > 85) {
        planet.description += " " + randomStarport();
      }
    }

    return planet;
  }
}

function calculateGravity(diameter: number, mass: number): number {
  const G = (9.8 * Math.pow(6378000, 2)) / 5972190000000000000000000.0;

  const r = diameter / 2.0;

  return (G * mass) / Math.pow(r, 2);
}

function getFriendlyPopulation(pop: number): string {
  const formatter = new Intl.NumberFormat();

  if (pop < 1000000.0) {
    return formatter.format(Math.floor(pop / 1000.0)) + " thousand";
  }

  if (pop < 1000000000.0) {
    return formatter.format(pop / 1000000.0) + " million";
  }

  return formatter.format(pop / 1000000000.0) + " billion";
}

function randomPopulation(): number {
  const options = [
    random.float(10.0, 700.0) * 1000.0,
    random.float(10.0, 900.0) * 1000000.0,
    random.float(1.0, 10.0) * 1000000000.0,
  ];

  return RND.item(options);
}

function randomStarport(): string {
  const starportType = RND.item(["military", "civilian"]);

  let features: string[];

  if (starportType == "military") {
    features = ["strategic position", "regular starfighter drills", "oppressive presence"];
  } else {
    features = ["important trade route position", "usage by smugglers and pirates", "beautiful architecture"];
  }

  const feature = RND.item(features);

  const descriptor = RND.item(["major", "minor", "curious", "sprawling", "towering"]);

  return `There is a ${descriptor} ${starportType} starport here, notable for its ${feature}.`;
}
