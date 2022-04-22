'use strict';

import AridPlanet from './planets/arid.glsl';
import BarrenPlanet from './planets/barren.glsl';
import GardenPlanet from './planets/garden.glsl';
import Shader from './shader';

export function all() {
  return [
    new Shader('arid planet', AridPlanet),
    new Shader('barren planet', BarrenPlanet),
    new Shader('garden planet', GardenPlanet),
  ];
}
