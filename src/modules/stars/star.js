"use strict";

import * as RND from "../random.js";
import * as StarNames from "../names/stars.js";
import * as Words from "../words.js";

const random = require("random");

export class Star {
  name;
  color;
  description;
  classification;
  radius; // in km
  mass; // in 10^30 kg
  temperature; // in K
  luminosity; // in 10^26 W
}

export class StarClassification {
  name;
  radius_min; // relative to the sun
  radius_max; // relative to the sun
  mass_min; // relative to the sun
  mass_max; // relative to the sun
  temperature_min; // in K
  temperature_max; // in K
  luminosity_min; // relative to the sun
  luminosity_max; // relative to the sun
  weight; // commonality in the universe
  constructor(name, radius_min, radius_max, mass_min, mass_max, temperature_min, temperature_max, luminosity_min, luminosity_max, weight) {
    this.name = name;
    this.radius_min = radius_min;
    this.radius_max = radius_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.temperature_min = temperature_min;
    this.temperature_max = temperature_max;
    this.luminosity_min = luminosity_min;
    this.luminosity_max = luminosity_max;
    this.weight = weight;
  }
}

export function getColorFromTemperature(temperature) {
  if (temperature < 3700) {
    return "red";
  } else if (temperature < 5200) {
    return "orange";
  } else if (temperature < 6000) {
    return "yellow";
  } else if (temperature < 7500) {
    return "yellow-white";
  } else if (temperature < 10000) {
    return "white";
  } else if (temperature < 30000) {
    return "blue-white";
  }

  return "blue";
}

export function getAllClassifications() {
  return [
    new StarClassification("main sequence", 0.1, 0.5, 0.1, 0.5, 2000, 4000, 0.01, 0.05, 40),
    new StarClassification("main sequence", 0.6, 0.9, 0.6, 0.8, 4000, 5000, 0.1, 0.8, 45),
    new StarClassification("main sequence", 0.9, 1.1, 0.8, 1.3, 5000, 6000, 0.8, 3.0, 60),
    new StarClassification("main sequence", 1.1, 1.5, 1.3, 1.8, 6000, 8000, 3.0, 8.0, 30),
    new StarClassification("main sequence", 1.5, 4.0, 1.8, 5.0, 8000, 15000, 15.0, 25.0, 10),
    new StarClassification("main sequence", 4.0, 6.0, 8.0, 12.0, 15000, 25000, 900.0, 1100.0, 5),
    new StarClassification("main sequence", 8.0, 12.0, 45.0, 55.0, 35000, 45000, 90000.0, 110000.0, 1),
    new StarClassification("giant", 10.0, 50.0, 1.0, 5.0, 3000, 10000, 50.0, 1000.0, 2),
    new StarClassification("supergiant", 30.0, 500.0, 10.0, 70.0, 4000, 40000, 30000.0, 1000000.0, 1),
  ];
}

export function randomWeightedClassification() {
  let all = getAllClassifications();

  return RND.weighted(all);
}

export function generate() {
  let classification = randomWeightedClassification();

  let star = new Star();

  star.classification = classification.name;
  star.radius = random.float(classification.radius_min, classification.radius_max) * 695508;
  star.mass = random.float(classification.mass_min, classification.mass_max) * 1.989;
  star.temperature = random.int(classification.temperature_min, classification.temperature_max);
  star.luminosity = random.float(classification.luminosity_min, classification.luminosity_max) * 3.828;
  star.color = getColorFromTemperature(star.temperature);

  let article = Words.article(star.color);
  star.description = `This is ${article} ${star.color} ${star.classification} star.`;
  star.name = StarNames.generate();

  return star;
}
