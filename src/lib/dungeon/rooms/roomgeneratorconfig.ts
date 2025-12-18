import type * as RNG from "@ironarachne/rng";
import type RoomTheme from "./themes/theme.js";

export default class RoomGeneratorConfig {
  mapHeight: number;
  mapWidth: number;
  theme: RoomTheme;
  rng: RNG.RNG;

  constructor(mapWidth: number, mapHeight: number, theme: RoomTheme, rng: RNG.RNG) {
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.theme = theme;
    this.rng = rng;
  }
}
