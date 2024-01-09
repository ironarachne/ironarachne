import * as Classifications from "./classifications.js";
import * as Culture from "./culture.js";
import * as Government from "./government.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import type Planet from "./planet.js";
import random from "random";
import type PlanetGeneratorConfig from "./planet_generator_config";

export function calculateGravity(diameter: number, mass: number): number {
  const G = (9.8 * 6378000 ** 2) / 5972190000000000000000000;

  const r = diameter / 2.0;

  return (G * mass) / r ** 2;
}

export function calculateRotationPeriod(diameter: number): number {
  const ratio = diameter / 12742.0;
  const periodRatio = ratio ** 0.5;
  const period = 24.0 * periodRatio + random.float(-2.0, 2.0);

  return period;
}

export function generate(config: PlanetGeneratorConfig) {
  const classification = RND.item(config.possibleClassifications);

  const planet: Planet = {
    name: "",
    description: "",
    culture: "N/A",
    government: "N/A",
    population: 0,
    populationFriendly: "uninhabited",
    is_inhabited: false,
    classification: classification.name,
    mass: 0,
    gravity: 0,
    diameter: 0,
    orbital_period: 0,
    rotation_period: 0,
    distance_from_sun: 0,
    has_clouds: false,
    has_atmosphere: false,
  };

  planet.name = MUN.planet();
  planet.mass = RND.bellFloat(classification.mass_min, classification.mass_max);
  planet.diameter = RND.bellFloat(
    classification.diameter_min,
    classification.diameter_max,
  );
  planet.orbital_period = RND.bellFloat(
    classification.orbital_period_min,
    classification.orbital_period_max,
  );
  planet.rotation_period = calculateRotationPeriod(planet.diameter);
  planet.distance_from_sun = RND.bellFloat(
    classification.distance_from_sun_min,
    classification.distance_from_sun_max,
  );
  planet.gravity = calculateGravity(
    planet.diameter * 1000,
    planet.mass * 10 ** 24,
  );
  planet.has_clouds = classification.has_clouds;
  planet.has_atmosphere = classification.has_atmosphere;

  if (classification.is_inhabitable) {
    const chance = RND.simple(100);
    if (chance > config.inhabitedChance) {
      planet.is_inhabited = true;
    }
  }

  planet.description = classification.getRandomDescription();

  if (planet.is_inhabited) {
    planet.population = randomPopulation();
    planet.populationFriendly = getFriendlyPopulation(planet.population);
    planet.culture = Culture.generate();
    planet.government = Government.generate();

    const chanceOfStarport = RND.simple(100);

    if (chanceOfStarport > config.starportChance) {
      planet.description += ` ${getRandomStarport()}`;
    }
  }

  return planet;
}

export function getFriendlyPopulation(pop: number): string {
  const formatter = new Intl.NumberFormat();

  if (pop < 1000000.0) {
    return `${formatter.format(Math.floor(pop / 1000.0))} thousand`;
  }

  if (pop < 1000000000.0) {
    return `${formatter.format(pop / 1000000.0)} million`;
  }

  return `${formatter.format(pop / 1000000000.0)} billion`;
}

export function randomPopulation(): number {
  const options = [
    random.float(10.0, 700.0) * 1000.0,
    random.float(10.0, 900.0) * 1000000.0,
    random.float(1.0, 10.0) * 1000000000.0,
  ];

  return RND.item(options);
}

export function getRandomStarport(): string {
  const types = [
    {
      name: "civilian",
      commonality: 15,
      options: [
        {
          name: "starport",
          commonality: 15,
          generateDescription: () => {
            return RND.item([
              `There is a ${RND.item([
                "major",
                "minor",
                "notable",
              ])} starport here.`,
              "A major starport here offers transit services, cargo services, and fueling services.",
              "This planet's primary starport is a major transit hub.",
              `This planet's primary starport is ${RND.item([
                "notable",
                "well-known",
                "famous",
              ])} for its ${RND.item([
                "architecture",
                "efficiency",
                "labyrinthine terminals",
                "austere construction",
                "budget-friendly options",
                "close proximity to many routes",
              ])}.`,
            ]);
          },
        },
        {
          name: "trade hub",
          commonality: 5,
          generateDescription: () => {
            return RND.item([
              "This planet sits on an important trade route and has a bustling starport for cargo.",
              "This planet is a major trade hub and has a bustling starport for cargo.",
              "A cargo starport sprawls across landscape, its colossal storage facilities standing like monoliths against the horizon, where haulers from the cosmos load and unload their precious cargoes.",
              "There is a cargo starport here for the trade route that passes through this system.",
              "There is a cargo starport here that serves as a vital link in the interstellar supply chain.",
              "Massive storage facilities sprawl outward from a major cargo starport here.",
            ]);
          },
        },
        {
          name: "passenger starport",
          commonality: 5,
          generateDescription: () => {
            return RND.item([
              "There is a major passenger starport here.",
              "This planet is on a major transit route and has a notable starport to serve traffic.",
              "A major passenger starport offers transit to and from this planet.",
              "This planet has a notable passenger starport.",
              "There is a passenger starport here notable for its beautiful architecture.",
              "The passenger starport here bustles with activity.",
              "The passenger starport here is a major transit hub.",
              "The passenger starport here is a major transit hub, and is notable for its beautiful architecture.",
              "The passenger starport here is well known for its impressive efficiency.",
            ]);
          },
        },
      ],
    },
    {
      name: "military",
      commonality: 5,
      options: [
        {
          name: "depot",
          commonality: 5,
          generateDescription: () => {
            return RND.item([
              "This planet has a military depot.",
              "This planet's military has a notable depot starport here.",
              "The military has a depot starport here.",
              `There is a ${RND.item([
                "secure",
                "heavily guarded",
                "fortified",
                "camouflaged",
              ])} military depot here.`,
            ]);
          },
        },
        {
          name: "strategic",
          commonality: 10,
          generateDescription: () => {
            return RND.item([
              `There is a ${RND.item([
                "secure",
                "heavily guarded",
                "fortified",
                "camouflaged",
              ])} military starport here.`,
              "This planet's military has a notable starport here.",
              `This planet has a military starport here. It is ${RND.item([
                "heavily guarded",
                "fortified",
                "shielded",
              ])}, and is a strategic position.`,
              `This planet has a major military starport here. It's often filled with ${RND.item(
                [
                  "small scout ships",
                  "warships",
                  "vanguard ships",
                  "resupply ships",
                ],
              )} and serves as ${RND.item([
                "a recon hub",
                "a strategic base",
                "an advance base",
                "a resupply station",
              ])}.`,
            ]);
          },
        },
      ],
    },
  ];

  const type = RND.weighted(types);
  const option = RND.weighted(type.options);

  return option.generateDescription();
}
