import * as iarnd from "../random.js";
import * as StarSystemRenderer from "./render.js";
import * as StarSystemName from "../names/starsystems.js";
import * as Words from "../words.js";
import * as Planet from "../planets/planet.js";
import * as PlanetRenderer from "../renderers/planets/planet-svg.js";

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

  let star = randomStar(graphicWidth, graphicHeight);
  star.name = starsystem.name;
  star.svg = StarSystemRenderer.renderStar(
    graphicWidth,
    graphicHeight,
    star.color,
    star.classification
  );

  starsystem.stars.push(star);

  let numberOfPlanets = random.int(3, 12);

  for (let i=0;i<numberOfPlanets;i++) {
    let planet = Planet.generate('random');
    planet.svg = PlanetRenderer.render(graphicWidth, graphicHeight, planet);
    starsystem.planets.push(planet);
  }

  starsystem.planets.sort(function(x, y) {
    if (x.distance_from_sun < y.distance_from_sun) {
      return -1;
    }
    if (x.distance_from_sun > y.distance_from_sun) {
      return 1;
    }
    return 0;
  });

  for (let i=0;i<starsystem.planets.length;i++) {
    if (!starsystem.planets[i].is_inhabited) {
      starsystem.planets[i].name = starsystem.name + " " + Words.romanize(i + 1);
    }
  }

  starsystem.description =
    `The ${starsystem.name} system has ${numberOfPlanets} planets`;

  let asteroidBeltChance = random.int(1, 100);

  if (asteroidBeltChance > 70) {
    starsystem.description += " and an asteroid belt.";
  } else {
    starsystem.description += ".";
  }

  return starsystem;
}

function randomStar() {
  let star = iarnd.item([
    {
      color: "red",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "yellow",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "orange",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "white",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 2,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "red",
      classification: "dwarf",
      minInner: 0,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 0,
      minOuter: 2,
      maxOuter: 4,
    },
    {
      color: "white",
      classification: "dwarf",
      minInner: 0,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 0,
      minOuter: 0,
      maxOuter: 4,
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
