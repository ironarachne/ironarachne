"use strict";

import * as StarSystemRenderer from "./render";
import * as Words from "../words";
import * as Star from "../stars/star";
import * as Planet from "../planets/planet";
import * as PlanetRenderer from "../renderers/planets/planet-svg";

const random = require("random");

export class StarSystem {
  name: string;
  description: string;
  stars: Star.Star[];
  planets: Planet.Planet[];

  constructor() {
    this.name = "";
    this.description = "";
    this.stars = [];
    this.planets = [];
  }
}

export function generate() {
  const starsystem = new StarSystem();

  const graphicWidth = 128;
  const graphicHeight = 128;

  const star = Star.generate();

  star.svg = StarSystemRenderer.renderStar(
    graphicWidth,
    graphicHeight,
    star.color,
    star.classification
  );

  starsystem.name = star.name;

  starsystem.stars.push(star);

  const numberOfPlanets = random.int(3, 12);

  for (let i = 0; i < numberOfPlanets; i++) {
    const planet = Planet.generate("random");
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

  const asteroidBeltChance = random.int(1, 100);

  if (asteroidBeltChance > 70) {
    starsystem.description += " and an asteroid belt.";
  } else {
    starsystem.description += ".";
  }

  return starsystem;
}
