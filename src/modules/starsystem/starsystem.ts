"use strict";

import * as StarSystemRenderer from "./render";
import * as Words from "../words";
import * as Star from "../stars/star";
import * as Planet from "../planets/planet";
import * as PlanetRenderer from "../renderers/planets/planet-svg";

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

  let star = Star.generate();

  star.svg = StarSystemRenderer.renderStar(
    graphicWidth,
    graphicHeight,
    star.color,
    star.classification
  );

  starsystem.name = star.name;

  starsystem.stars.push(star);

  let numberOfPlanets = random.int(3, 12);

  for (let i = 0; i < numberOfPlanets; i++) {
    let planet = Planet.generate("random");
    planet.svg = PlanetRenderer.render(graphicWidth, graphicHeight, planet);
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
