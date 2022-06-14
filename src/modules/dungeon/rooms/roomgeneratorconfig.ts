'use strict';

import RoomTheme from './themes/theme';

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
