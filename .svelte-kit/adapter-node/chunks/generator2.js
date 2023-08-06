import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import * as Words from "@ironarachne/words";
class PlanetClassification {
  name;
  diameter_min;
  // in km
  diameter_max;
  // in km
  mass_min;
  // in 10^24 kg
  mass_max;
  // in 10^24 kg
  orbital_period_min;
  // in Earth days
  orbital_period_max;
  // in Earth days
  distance_from_sun_min;
  // in AU
  distance_from_sun_max;
  // in AU
  is_inhabitable;
  has_clouds;
  has_atmosphere;
  constructor(name, diameter_min, diameter_max, mass_min, mass_max, orbital_period_min, orbital_period_max, distance_from_sun_min, distance_from_sun_max, is_inhabitable, has_clouds, has_atmosphere) {
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
function getClassificationNames() {
  const classifications = all();
  let results = [];
  for (let i = 0; i < classifications.length; i++) {
    results.push(classifications[i].name);
  }
  return results;
}
function getHazardsForClassification(classification) {
  const hazards = {
    arid: [
      "The atmosphere is very thin and breathing apparatus is required outside.",
      "Vast sandstorms occasionally sweep across the surface of the planet.",
      "High winds sometimes create dangerous dust storms that can destroy unprotected buildings and ships.",
      "Dune seas across the planet are home to a dangerous species of predator.",
      "Sandstorms of horrific velocity arise without warning."
    ],
    barren: [
      "There is no atmosphere. A vaccsuit is required.",
      "Meteor strikes are frequent.",
      "The landscape is peppered with debris from meteor strikes, making travel difficult.",
      "Unprotected by an atmosphere, this world is constantly bombarded by powerful radiation.",
      "The surface is covered in radioactive remains of crashed starships."
    ],
    garden: [
      "Life is prolific here, and there are many dangerous native predators.",
      "A local virus is highly dangerous to non-natives.",
      "There are many dangerous plants and animals on this world.",
      "Rainstorms on this planet cause frequent floods in the lower-lying areas.",
      "Several species of local insects are highly venomous.",
      "A primitive local sapient species is extremely aggressive."
    ],
    "gas giant": [
      "Vast storms the size of small planets rage across the surface.",
      "An aggressive species of floating leviathan is widespread across this planet.",
      "Navigating the upper atmosphere is possible but dangerous due to the many chaotic weather systems.",
      "The gasses making up the planet's atmosphere are highly corrosive and dangerous to spacecraft.",
      "The highly-combustible gasses of the upper atmosphere are easily ignited."
    ],
    ice: [
      "Fierce winds whip the surface, chilling the air well below the normal temperatures.",
      "The ice is thinner in places and cannot hold heavy vehicles or starships.",
      "Occasional meteor storms cause explosions of sharp shattered ice that shower for miles.",
      "Pockets of superheated gas beneath the ice sometimes cause the surface to burst and unleash a geyser of hot gas, boiling water, and shards of ice.",
      "Ice storms are common all over the planet."
    ],
    jungle: [
      "There are numerous species of deadly predator living in the jungle.",
      "The heat and humidity of this world make it a constant struggle to keep plantlife from claiming settlements.",
      "It is unbearably hot for non-natives most of the time, requiring a suit for outdoor activity.",
      "Hidden throughout the greenery of the jungle are spots of quicksand that will devour unwary travellers.",
      "Local life is massive and even the herbivores are extremely dangerous."
    ],
    ocean: [
      "The still waters hide monstrous leviathans that can devour entire cities.",
      "Ferocious swarms of fish plague the surface.",
      "Vast blooms of algae can corrode even the most advanced armor.",
      "The water contains acidic substances that erode metal but leave plastics untouched.",
      "A local species of fish emits an unbearable sonic blast when threatened."
    ],
    swamp: [
      "It's very difficult to tell where solid land is. Landing on what appears to be a muddy plain might result in sinking forever into the muck.",
      "A species of parasitic insect local to the planet carries a nasty disease that is highly contagious.",
      "The complicated ecosystem is easy to upset, and outside interference can cause widespread destruction.",
      "The atmosphere is very thick, requiring breathing apparatus for outside activity.",
      "A species of aerial predator makes being exposed highly dangerous."
    ],
    toxic: [
      "The air is corrosive and will erode unprotected equipment.",
      "The planet's surface is covered in many acid lakes.",
      "Toxins in the air are so virulent that they will eat through even heavy protection eventually.",
      "Corrosive elements in the water make the seas and rain deadly to manmade structures.",
      "Acid rainstorms are frequent."
    ],
    volcanic: [
      "Deadly eruptions are frequent.",
      "Lava flows in several areas are unpredictable and quick to change direction.",
      "The air is filled with poisonous gases released by eruptions.",
      "Acid rains frequently plague this world.",
      "Ashes from eruptions cause havoc with unfiltered systems."
    ]
  };
  return Reflect.get(hazards, classification.name);
}
function all() {
  return [
    new PlanetClassification("arid", 9500, 19e3, 1, 8, 237, 500, 0.4, 2.4, true, true, true),
    new PlanetClassification(
      "barren",
      4800,
      19e3,
      0.3,
      0.65,
      80,
      1500,
      0.3,
      6,
      false,
      false,
      false
    ),
    new PlanetClassification(
      "garden",
      1e4,
      14e3,
      3,
      7,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "gas giant",
      45e3,
      15e4,
      85,
      1900,
      4e3,
      7e4,
      5,
      40,
      false,
      false,
      true
    ),
    new PlanetClassification(
      "ice",
      4800,
      19e3,
      0.3,
      0.65,
      4e3,
      8e4,
      5,
      60,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "jungle",
      9500,
      19e3,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "ocean",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "swamp",
      9500,
      19e3,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "toxic",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "volcanic",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    )
  ];
}
class PlanetGeneratorConfig {
  possibleClassifications;
  constructor() {
    this.possibleClassifications = all();
  }
}
function generate$1() {
  let possibleTraits = RND.shuffle([
    ["warlike", "violent", "peaceful", "pacifist"],
    ["matriarchal", "patriarchal", "matrilineal", "patrilineal"],
    ["spiritual", "secular"],
    ["chaotic", "orderly", "caste-based"],
    ["conservative", "progressive", "traditional"],
    ["xenophobic", "xenophilic", "welcoming"],
    ["forgiving", "unforgiving"]
  ]);
  let characteristics = [];
  const numberOfTraits = random.int(1, 3);
  for (let i = 0; i < numberOfTraits; i++) {
    let trait = possibleTraits.pop();
    characteristics.push(RND.item(trait));
  }
  return Words.arrayToPhrase(characteristics);
}
function generate() {
  const governmentTypes = [
    ["feudal theocracy", "autocratic theocracy", "totalitarian theocracy"],
    ["representative democracy", "direct democracy", "republic", "parliamentary republic"],
    ["corporatocracy", "feudal technocracy", "technocratic republic"],
    ["absolute monarchy", "monarchy", "constitutional monarchy", "feudal monarchy"]
  ];
  return RND.item(RND.item(governmentTypes));
}
class Planet {
  name;
  description;
  culture;
  government;
  population;
  populationFriendly;
  is_inhabited;
  classification;
  mass;
  // in 10^24 kg
  gravity;
  // in m/s^2
  diameter;
  // in km
  orbital_period;
  // in Earth days
  distance_from_sun;
  // in AU
  has_clouds;
  has_atmosphere;
  constructor() {
    this.name = "";
    this.description = "";
    this.classification = new PlanetClassification("", 0, 0, 0, 0, 0, 0, 0, 0, false, false, false);
    this.culture = "N/A";
    this.government = "N/A";
    this.population = 0;
    this.populationFriendly = "Uninhabited";
    this.is_inhabited = false;
    this.mass = 0;
    this.gravity = 0;
    this.diameter = 0;
    this.orbital_period = 0;
    this.distance_from_sun = 0;
    this.has_clouds = false;
    this.has_atmosphere = false;
  }
}
class PlanetGenerator {
  config;
  constructor(config) {
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
      classification.orbital_period_max
    );
    planet.distance_from_sun = RND.bellFloat(
      classification.distance_from_sun_min,
      classification.distance_from_sun_max
    );
    planet.gravity = calculateGravity(planet.diameter * 1e3, planet.mass * Math.pow(10, 24));
    planet.has_clouds = classification.has_clouds;
    planet.has_atmosphere = classification.has_atmosphere;
    if (classification.is_inhabitable) {
      const chance = random.int(1, 100);
      if (chance > 60) {
        planet.is_inhabited = true;
      }
    }
    planet.description += RND.item(getHazardsForClassification(classification));
    if (planet.is_inhabited) {
      planet.population = randomPopulation();
      planet.populationFriendly = getFriendlyPopulation(planet.population);
      planet.culture = generate$1();
      planet.government = generate();
      const chanceOfStarport = random.int(1, 100);
      if (chanceOfStarport > 85) {
        planet.description += " " + randomStarport();
      }
    }
    return planet;
  }
}
function calculateGravity(diameter, mass) {
  const G = 9.8 * Math.pow(6378e3, 2) / 597219e19;
  const r = diameter / 2;
  return G * mass / Math.pow(r, 2);
}
function getFriendlyPopulation(pop) {
  const formatter = new Intl.NumberFormat();
  if (pop < 1e6) {
    return formatter.format(Math.floor(pop / 1e3)) + " thousand";
  }
  if (pop < 1e9) {
    return formatter.format(pop / 1e6) + " million";
  }
  return formatter.format(pop / 1e9) + " billion";
}
function randomPopulation() {
  const options = [
    random.float(10, 700) * 1e3,
    random.float(10, 900) * 1e6,
    random.float(1, 10) * 1e9
  ];
  return RND.item(options);
}
function randomStarport() {
  const starportType = RND.item(["military", "civilian"]);
  let features;
  if (starportType == "military") {
    features = ["strategic position", "regular starfighter drills", "oppressive presence"];
  } else {
    features = ["important trade route position", "usage by smugglers and pirates", "beautiful architecture"];
  }
  const feature = RND.item(features);
  const descriptor = RND.item(["major", "minor", "curious", "sprawling", "towering"]);
  return `There is a ${descriptor} ${starportType} starport here, notable for its ${feature}.`;
}
export {
  PlanetGenerator as P,
  PlanetGeneratorConfig as a,
  getClassificationNames as g
};
