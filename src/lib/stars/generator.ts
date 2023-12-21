import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import type StarGeneratorConfig from "./generatorconfig.js";

import random from "random";
import Star from "./star.js";
import type RGBColor from "$lib/graphics/rgb_color.js";

export default class StarGenerator {
  config: StarGeneratorConfig;

  constructor(config: StarGeneratorConfig) {
    this.config = config;
  }

  generate() {
    const classification = RND.weighted(this.config.possibleClassifications);

    const star = new Star();

    star.classification = classification.name;
    star.radius =
      random.float(classification.radius_min, classification.radius_max) *
      695508;
    star.mass =
      random.float(classification.mass_min, classification.mass_max) * 1.989;
    star.temperature = random.int(
      classification.temperature_min,
      classification.temperature_max,
    );
    star.luminosity =
      random.float(
        classification.luminosity_min,
        classification.luminosity_max,
      ) * 3.828;

    const colorSet = this.getColorSetFromTemperature(star.temperature);

    star.color = this.getColorFromTemperature(star.temperature);
    star.primaryColor = colorSet[0];
    star.secondaryColor = colorSet[1];
    star.glowColor = colorSet[2];

    const article = Words.article(star.color);
    star.description = `This is ${article} ${star.color} ${star.classification} star.`;
    star.name = MUN.star();

    return star;
  }

  getColorFromTemperature(temperature: number): string {
    if (temperature < 3700) {
      return "red";
    }

    if (temperature < 5200) {
      return "orange";
    }

    if (temperature < 6000) {
      return "yellow";
    }

    if (temperature < 7500) {
      return "yellow-white";
    }

    if (temperature < 10000) {
      return "white";
    }

    if (temperature < 30000) {
      return "blue-white";
    }

    return "blue";
  }

  getColorSetFromTemperature(temperature: number): RGBColor[] {
    if (temperature < 3700) {
      return [
        { r: 1.0, g: 0.0, b: 0.0 },
        { r: 0.5, g: 0.0, b: 0.0 },
        { r: 1.0, g: 0.0, b: 0.0 },
      ];
    }

    if (temperature < 5200) {
      return [
        { r: 1.0, g: 0.39, b: 0.0 },
        { r: 0.7, g: 0.13, b: 0.0 },
        { r: 1.0, g: 1.0, b: 0.0 },
      ];
    }

    if (temperature < 6000) {
      return [
        { r: 1.0, g: 1.0, b: 0.0 },
        { r: 0.55, g: 0.35, b: 0.0 },
        { r: 1.0, g: 1.0, b: 0.5 },
      ];
    }

    if (temperature < 7500) {
      return [
        { r: 1.0, g: 1.0, b: 0.9 },
        { r: 0.95, g: 0.95, b: 0.7 },
        { r: 1.0, g: 1.0, b: 1.0 },
      ];
    }

    if (temperature < 10000) {
      return [
        { r: 1.0, g: 1.0, b: 1.0 },
        { r: 0.95, g: 0.95, b: 0.95 },
        { r: 1.0, g: 1.0, b: 1.0 },
      ];
    }

    if (temperature < 30000) {
      return [
        { r: 0.85, g: 0.9, b: 1.0 },
        { r: 0.7, g: 0.75, b: 0.95 },
        { r: 1.0, g: 1.0, b: 1.0 },
      ];
    }

    return [
      { r: 0.0, g: 0.0, b: 1.0 },
      { r: 0.0, g: 0.0, b: 0.75 },
      { r: 0.0, g: 0.2, b: 1.0 },
    ];
  }
}
