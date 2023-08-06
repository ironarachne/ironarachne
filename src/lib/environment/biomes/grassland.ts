"use strict";

import type Biome from "./biome.js";

export default class Grassland implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = "grassland";
    this.temperature = 6;
    this.altitude = 2;
    this.humidity = 4;
    this.isAquatic = false;
    this.descriptions = [
      "This area's broad open spaces are covered in tall grasses.",
      "Low rolling hills make up this region.",
      "The occasional hill breaks up what is otherwise a vast expanse of flat grassland.",
      "The vast grassland, with its undulating sea of grasses and scattered wildflowers, spreads out as far as the eye can see under the endless blue sky.",
      "The vast expanse of the grassland, with its rolling hills and endless fields of tall, swaying grasses, stretches out before the horizon in a sea of green and gold.",
      "The lush grassland teems with life, as herds of grazing animals roam freely amidst the verdant fields, and colorful wildflowers sway gently in the breeze, filling the air with their sweet fragrance.",
    ];
    this.features = [
      "The tall grasses here resemble ocean waves in the breeze.",
      "Wild horses are common here.",
      "The sun rising over the grassy plains causes some awe-inspiring sunrises here.",
      "Birds of every description make their home here.",
      "Though the terrain is mostly low rolling hills, there are one or two rocky cliffs jutting out of the landscape.",
      "The grass here is uncommonly tall, coming up to chest height.",
      "The grassland's vast and uninterrupted skyline is dotted with towering clouds that cast long shadows on the rolling hills below, creating a breathtaking spectacle that seems to go on forever.",
      "The imposing and craggy outcroppings of rock that dot the grassland stand like silent sentinels against the wide open sky.",
    ];
  }
}
