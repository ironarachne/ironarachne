"use strict";

import * as RND from "../random";
import * as PlanetName from "../names/planets";

const random = require("random");

export class Planet {
  name: string;
  description: string;
  culture: string;
  government: string;
  population: string;
  is_inhabited: boolean;
  classification: string;
  mass: number; // in 10^24 kg
  gravity: number; // in m/s^2
  diameter: number; // in km
  orbital_period: number; // in Earth days
  distance_from_sun: number; // in AU
  has_clouds: boolean;
  has_atmosphere: boolean;
  svg: string;

  constructor() {
    this.name = "";
    this.description = "";
    this.culture = "";
    this.government = "";
    this.population = "";
    this.is_inhabited = false;
    this.classification = "";
    this.mass = 0;
    this.gravity = 0;
    this.diameter = 0;
    this.orbital_period = 0;
    this.distance_from_sun = 0;
    this.has_clouds = false;
    this.has_atmosphere = false;
    this.svg = "";
  }
}

export class PlanetClassification {
  name: string;
  diameter_min: number; // in km
  diameter_max: number; // in km
  mass_min: number; // in 10^24 kg
  mass_max: number; // in 10^24 kg
  orbital_period_min: number; // in Earth days
  orbital_period_max: number; // in Earth days
  distance_from_sun_min: number; // in AU
  distance_from_sun_max: number; // in AU
  is_inhabitable: boolean;
  has_clouds: boolean;
  has_atmosphere: boolean;

  constructor(name: string, diameter_min: number, diameter_max: number, mass_min: number, mass_max: number, orbital_period_min: number, orbital_period_max: number, distance_from_sun_min: number, distance_from_sun_max: number, is_inhabitable: boolean, has_clouds: boolean, has_atmosphere: boolean) {
    this.name = name;
    this.diameter_min = diameter_min;
    this.diameter_max = diameter_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.orbital_period_min = orbital_period_min;
    this.orbital_period_max = orbital_period_max;
    this.distance_from_sun_min = distance_from_sun_min;
    this.distance_from_sun_max = distance_from_sun_max;
    this.is_inhabitable = is_inhabitable;
    this.has_clouds = has_clouds;
    this.has_atmosphere = has_atmosphere;
  }
}

export function getAllClassifications() {
  return [
    new PlanetClassification("arid", 9500, 19000, 1.0, 8.0, 237, 500, 0.4, 2.4, true, true, true),
    new PlanetClassification("barren", 4800, 19000, 0.3, 0.65, 80, 1500, 0.3, 6.0, false, false, false),
    new PlanetClassification("garden", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
    new PlanetClassification("gas giant", 45000, 150000, 85.0, 1900.0, 4000, 70000, 5.0, 40.0, false, false, true),
    new PlanetClassification("ice", 4800, 19000, 0.3, 0.65, 4000, 80000, 5.0, 60.0, true, true, true),
    new PlanetClassification("jungle", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
    new PlanetClassification("ocean", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
    new PlanetClassification("swamp", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
    new PlanetClassification("toxic", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
    new PlanetClassification("volcanic", 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true, true),
  ];
}

function getHazardsForClassification(classification: PlanetClassification) {
  const hazards = {
    arid: [
      "The atmosphere is very thin and breathing apparatus is required outside.",
      "Vast sandstorms occasionally sweep across the surface of the planet.",
      "High winds sometimes create dangerous dust storms that can destroy unprotected buildings and ships.",
      "Dune seas across the planet are home to a dangerous species of predator.",
    ],
    barren: [
      "There is no atmosphere. A vaccsuit is required.",
      "Meteor strikes are frequent.",
      "The landscape is peppered with debris from meteor strikes, making travel difficult.",
      "Unprotected by an atmosphere, this world is constantly bombarded by powerful radiation.",
    ],
    garden: [
      "Life is prolific here, and there are many dangerous native predators.",
      "A local virus is highly dangerous to non-natives.",
      "There are many dangerous plants and animals on this world.",
      "Rainstorms on this planet cause frequent floods in the lower-lying areas.",
    ],
    "gas giant": [
      "Vast storms the size of small planets rage across the surface.",
      "An aggressive species of floating leviathan is widespread across this planet.",
      "Navigating the upper atmosphere is possible but dangerous due to the many chaotic weather systems.",
      "The gasses making up the planet's atmosphere are highly corrosive and dangerous to spacecraft.",
    ],
    ice: [
      "Fierce winds whip the surface, chilling the air well below the normal temperatures.",
      "The ice is thinner in places and cannot hold heavy vehicles or starships.",
      "Occasional meteor storms cause explosions of sharp shattered ice that shower for miles.",
      "Pockets of superheated gas beneath the ice sometimes cause the surface to burst and unleash a geyser of hot gas, boiling water, and shards of ice.",
    ],
    jungle: [
      "There are numerous species of deadly predator living in the jungle.",
      "The heat and humidity of this world make it a constant struggle to keep plantlife from claiming settlements.",
      "It is unbearably hot for non-natives most of the time, requiring a suit for outdoor activity.",
      "Hidden throughout the greenery of the jungle are spots of quicksand that will devour unwary travellers.",
    ],
    ocean: [
      "The still waters hide monstrous leviathans that can devour entire cities.",
      "Ferocious swarms of fish plague the surface.",
      "Vast blooms of algae can corrode even the most advanced armor.",
      "The water contains acidic substances that erode metal but leave plastics untouched.",
    ],
    swamp: [
      "It's very difficult to tell where solid land is. Landing on what appears to be a muddy plain might result in sinking forever into the muck.",
      "A species of parasitic insect local to the planet carries a nasty disease that is highly contagious.",
      "The complicated ecosystem is easy to upset, and outside interference can cause widespread destruction.",
      "The atmosphere is very thick, requiring breathing apparatus for outside activity.",
    ],
    toxic: [
      "The air is corrosive and will erode unprotected equipment.",
      "The planet's surface is covered in many acid lakes.",
      "Toxins in the air are so virulent that they will eat through even heavy protection eventually.",
      "Corrosive elements in the water make the seas and rain deadly to manmade structures.",
    ],
    volcanic: [
      "Deadly eruptions are frequent.",
      "Lava flows in several areas are unpredictable and quick to change direction.",
      "The air is filled with poisonous gases released by eruptions.",
      "Acid rains frequently plague this world.",
    ],
  };

  return Reflect.get(hazards, classification.name);
}

function calculateGravity(diameter: number, mass: number) {
  const G = (9.8 * Math.pow(6378000, 2)) / 5972190000000000000000000.0;

  const r = diameter / 2.0;

  return (G * mass) / (Math.pow(r, 2));
}

function getClassification(classificationName: string) {
  if (classificationName == "random") {
    return RND.item(getAllClassifications());
  }

  return getClassificationByName(classificationName);
}

function getClassificationByName(name: string) {
  const options = getAllClassifications();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }
}

export function generate(classificationName: string) {
  const classification = getClassification(classificationName);

  const planet = new Planet();
  planet.name = PlanetName.generate();
  planet.classification = classification.name;
  planet.mass = random.float(classification.mass_min, classification.mass_max);
  planet.diameter = random.float(classification.diameter_min, classification.diameter_max);
  planet.orbital_period = random.float(classification.orbital_period_min, classification.orbital_period_max);
  planet.distance_from_sun = random.float(classification.distance_from_sun_min, classification.distance_from_sun_max);
  planet.gravity = calculateGravity(planet.diameter * 1000, planet.mass * Math.pow(10, 24));
  planet.has_clouds = classification.has_clouds;
  planet.has_atmosphere = classification.has_atmosphere;

  if (classification.is_inhabitable) {
    const chance = random.int(1, 100);
    if (chance > 60) {
      planet.is_inhabited = true;
    }
  }

  if (planet.is_inhabited) {
    planet.population = randomPopulation();
    planet.culture = randomCulture();
    planet.government = randomGovernment();
  } else {
    planet.population = "Uninhabited";
    planet.culture = "N/A";
    planet.government = "N/A";
  }

  planet.description += RND.item(getHazardsForClassification(classification));

  return planet;
}

export function listPlanetTypes() {
  const allTypes = getAllClassifications();

  const types = [];

  for (let i = 0; i < allTypes.length; i++) {
    types.push(allTypes[i].name);
  }

  return types;
}

function randomCulture() {
  const options = [
    "Sexist",
    "Religious",
    "Artistic",
    "Ritualized",
    "Conservative",
    "Xenophobic",
    "Overriding Taboo",
    "Deceptive",
    "Liberal",
    "Honorable",
    "Influenced",
    "Fusion",
    "Barbaric",
    "Remnant",
    "Degenerate",
    "Progressive",
    "Recovering",
    "Nexus",
    "Tourist Attraction",
    "Violent",
    "Peaceful",
    "Obsessed",
  ];

  return RND.item(options);
}

function randomGovernment() {
  const options = [
    "Corporations",
    "Participatory Democracy",
    "Self-Perpetuating Oligarchy",
    "Representative Democracy",
    "Feudal Technocracy",
    "Captive Government",
    "Balkanized",
    "Civil Service Bureaucracy",
    "Charismatic Dictator",
    "Non-Charismatic Leader",
    "Charismatic Oligarchy",
    "Religious Dictatorship",
    "Religious Autocracy",
    "Totalitarian Oligarchy",
  ];

  return RND.item(options);
}

function randomPopulation() {
  const formatter = new Intl.NumberFormat();
  const options = [
    "" + random.int(10, 700) + " thousand",
    "" + formatter.format(random.float(10.0, 900.0)) + " million",
    "" + formatter.format(random.float(1.0, 10.0)) + " billion",
  ];

  return RND.item(options);
}
