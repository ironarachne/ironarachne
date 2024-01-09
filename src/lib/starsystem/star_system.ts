import type Planet from "$lib/planets/planet.js";
import type Star from "$lib/stars/star.js";

export default interface StarSystem {
  name: string;
  description: string;
  stars: Star[];
  planets: Planet[];
}
