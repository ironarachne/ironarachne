import type RoomTheme from "./themes/theme.js";

export default class RoomRequirement {
  theme: RoomTheme;
  minCount: number;
  maxCount: number;

  constructor(theme: RoomTheme, minCount: number, maxCount: number) {
    this.theme = theme;
    this.minCount = minCount;
    this.maxCount = maxCount;
  }
}
