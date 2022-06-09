'use strict';

import Planet from '../planets/planet';
import Star from '../stars/star';

export default class StarSystem {
  name: string;
  description: string;
  stars: Star[];
  planets: Planet[];

  constructor() {
    this.name = '';
    this.description = '';
    this.stars = [];
    this.planets = [];
  }
}
