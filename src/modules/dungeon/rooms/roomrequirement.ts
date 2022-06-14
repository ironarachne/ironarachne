'use strict';

import RoomTheme from './themes/theme';

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
