import * as iarnd from "../random.js";
import * as StarSystemRender from "./render.js";
import * as StarSystemName from "./name.js";
import * as Words from "../words.js";

const random = require("random");

export function generate() {
  let starsystem = {
    name: "",
    description: "",
    stars: [],
    planets: [],
  };

  let graphicWidth = 128;
  let graphicHeight = 128;

  starsystem.name = StarSystemName.generate();

  let numberOfInnerPlanets = random.int(1, 3);
  let numberOfGoldilocksPlanets = random.int(0, 2);
  let numberOfOuterPlanets = random.int(1, 3);

  let planetCount = 1;

  for (let i = 0; i < numberOfInnerPlanets; i++) {
    let planetType = randomInnerPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount);
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetType.svg,
      planetType.hasAtmosphere
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  for (let i = 0; i < numberOfGoldilocksPlanets; i++) {
    let planetType = randomGoldilocksPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount);
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetType.svg,
      planetType.hasAtmosphere
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  for (let i = 0; i < numberOfOuterPlanets; i++) {
    let planetType = randomOuterPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount);
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetType.svg,
      planetType.hasAtmosphere
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  let star = randomStar(graphicWidth, graphicHeight);
  star.name = starsystem.name;
  star.svg = StarSystemRender.renderStar(
    graphicWidth,
    graphicHeight,
    star.color,
    star.classification
  );

  starsystem.stars.push(star);

  starsystem.description =
    "The " + starsystem.name + " system has " + planetCount + " planets";

  let asteroidBeltChance = random.int(1, 100);

  if (asteroidBeltChance > 70) {
    starsystem.description += " and an asteroid belt.";
  } else {
    starsystem.description += ".";
  }

  return starsystem;
}

function allPlanetTypes() {
  return [
    {
      name: "barren",
      possibleRegions: ["inner", "goldilocks", "outer"],
      habitationChance: 0,
      hasAtmosphere: false,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="darkgrey" />',
    },
    {
      name: "arid",
      possibleRegions: ["inner", "goldilocks", "outer"],
      habitationChance: 15,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="tan" />',
    },
    {
      name: "garden",
      possibleRegions: ["goldilocks"],
      habitationChance: 85,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="darkcyan" />',
    },
    {
      name: "jungle",
      possibleRegions: ["goldilocks"],
      habitationChance: 65,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="forestgreen" />',
    },
    {
      name: "volcanic",
      possibleRegions: ["inner", "goldilocks"],
      habitationChance: 15,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="black" />',
    },
    {
      name: "gas giant",
      possibleRegions: ["outer"],
      habitationChance: 0,
      hasAtmosphere: false,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="purple" />',
    },
    {
      name: "toxic",
      possibleRegions: ["inner", "goldilocks", "outer"],
      habitationChance: 5,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="darkolivegreen" />',
    },
    {
      name: "ice",
      possibleRegions: ["goldilocks", "outer"],
      habitationChance: 15,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="white" />',
    },
    {
      name: "ocean",
      possibleRegions: ["goldilocks"],
      habitationChance: 20,
      hasAtmosphere: true,
      svg:
        '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="blue" />',
    },
  ];
}

function randomPlanet(planetType) {
  let planet = {
    name: "",
    inhabited: false,
    planetType: planetType,
    size: randomSize(),
  };

  let habitationChance = random.int(1, 100);

  if (habitationChance <= planet.planetType.habitationChance) {
    planet.inhabited = true;
  }

  planet.description =
    "This world is " +
    Words.article(planet.size) +
    " " +
    planet.size +
    " " +
    planetType.name +
    " planet.";

  if (planet.inhabited) {
    planet.description += " It is inhabited.";
  }

  return planet;
}

function randomSize() {
  return iarnd.item(["tiny", "small", "medium-sized", "large", "huge"]);
}

function randomStar() {
  let star = iarnd.item([
    {
      color: "red",
      classification: "main sequence",
    },
    {
      color: "yellow",
      classification: "main sequence",
    },
    {
      color: "orange",
      classification: "main sequence",
    },
    {
      color: "white",
      classification: "main sequence",
    },
    {
      color: "red",
      classification: "dwarf",
    },
    {
      color: "white",
      classification: "dwarf",
    },
  ]);

  star.description =
    "This is " +
    Words.article(star.color) +
    " " +
    star.color +
    " " +
    star.classification +
    " star.";

  return star;
}

function randomInnerPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("inner")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}

function randomGoldilocksPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("goldilocks")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}

function randomOuterPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("outer")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}
