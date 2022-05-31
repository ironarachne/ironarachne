'use strict';

import RoomFeature from './roomfeature';

export default class RoomTheme {
  name: string;
  features: RoomFeature[];

  constructor(name: string, features: RoomFeature[]) {
    this.name = name;
    this.features = features;
  }
}
