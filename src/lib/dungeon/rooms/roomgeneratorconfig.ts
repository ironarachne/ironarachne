import type RoomTheme from "./themes/theme.js";

export default class RoomGeneratorConfig {
  mapHeight: number;
  mapWidth: number;
  theme: RoomTheme;

  constructor(mapWidth: number, mapHeight: number, theme: RoomTheme) {
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.theme = theme;
  }
}
