"use strict";

import AridPlanet from "./planets/arid.glsl.js";
import BarrenPlanet from "./planets/barren.glsl.js";
import GardenPlanet from "./planets/garden.glsl.js";
import Shader from "./shader.js";

export function all() {
  return [
    new Shader("arid planet", AridPlanet),
    new Shader("barren planet", BarrenPlanet),
    new Shader("garden planet", GardenPlanet),
  ];
}
