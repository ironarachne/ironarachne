import * as iarnd from "../random.js";
import * as PlanetName from "../names/planets.js";

const random = require("random");

export class Planet {
  name;
  description;
  classification;
  mass; // in 10^24 kg
  gravity; // in m/s^2
  diameter; // in km
  orbital_period; // in Earth days
  distance_from_sun; // in AU
  has_clouds = false;
  has_atmosphere = false;
}

export class PlanetClassification {
  name;
  diameter_min; // in km
  diameter_max; // in km
  mass_min; // in 10^24 kg
  mass_max; // in 10^24 kg
  orbital_period_min; // in Earth days
  orbital_period_max; // in Earth days
  distance_from_sun_min; // in AU
  distance_from_sun_max; // in AU
  has_clouds;
  has_atmosphere;
  constructor(name, diameter_min, diameter_max, mass_min, mass_max, orbital_period_min, orbital_period_max, distance_from_sun_min, distance_from_sun_max, has_clouds, has_atmosphere) {
    this.name = name;
    this.diameter_min = diameter_min;
    this.diameter_max = diameter_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.orbital_period_min = orbital_period_min;
    this.orbital_period_max = orbital_period_max;
    this.distance_from_sun_min = distance_from_sun_min;
    this.distance_from_sun_max = distance_from_sun_max;
    this.has_clouds = has_clouds;
    this.has_atmosphere = has_atmosphere;
  }
}

export function getAllClassifications() {
  return [
    new PlanetClassification('arid', 9500, 19000, 1.0, 8.0, 237, 500, 0.4, 2.4, true, true),
    new PlanetClassification('barren', 4800, 19000, 0.3, 0.65, 80, 1500, 0.3, 6.0, false, false),
    new PlanetClassification('garden', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
    new PlanetClassification('gas giant', 45000, 150000, 85.0, 1900.0, 4000, 70000, 5.0, 40.0, false, true),
    new PlanetClassification('ice', 4800, 19000, 0.3, 0.65, 4000, 80000, 5.0, 60.0, true, true),
    new PlanetClassification('jungle', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
    new PlanetClassification('ocean', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
    new PlanetClassification('swamp', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
    new PlanetClassification('toxic', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
    new PlanetClassification('volcanic', 9500, 19000, 1.791, 11.94, 237, 500, 0.95, 2.4, true, true),
  ];
}

function calculateGravity(diameter, mass) {
  const G = (9.8 * Math.pow(6378000, 2)) / 5972190000000000000000000.0;

  let r = diameter/2.0;

  let gravity = (G * mass) / (Math.pow(r, 2));

  return gravity;
}

function getClassificationByName(name) {
  let options = getAllClassifications();

  for (let i=0;i<options.length;i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }
}

export function generate(classificationName) {
  let classification = {};

  if (classificationName == 'random') {
    classification = iarnd.item(getAllClassifications());
  } else {
    classification = getClassificationByName(classificationName);
  }

  let planet = new Planet();
  planet.name = PlanetName.generate();
  planet.classification = classification.name;
  planet.mass = random.float(classification.mass_min, classification.mass_max);
  planet.diameter = random.float(classification.diameter_min, classification.diameter_max);
  planet.orbital_period = random.float(classification.orbital_period_min, classification.orbital_period_max);
  planet.distance_from_sun = random.float(classification.distance_from_sun_min, classification.distance_from_sun_max);
  planet.gravity = calculateGravity(planet.diameter * 1000, planet.mass * Math.pow(10, 24));
  planet.has_clouds = classification.has_clouds;
  planet.has_atmosphere = classification.has_atmosphere;

  return planet;
}
