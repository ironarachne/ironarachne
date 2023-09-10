import Planet from "../planets/planet.js";
import Star from "../stars/star.js";

export default class StarSystem {
  name: string;
  description: string;
  stars: Star[];
  planets: Planet[];

  constructor() {
    this.name = "";
    this.description = "";
    this.stars = [];
    this.planets = [];
  }
}
