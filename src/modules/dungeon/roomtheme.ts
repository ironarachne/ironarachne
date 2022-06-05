'use strict';

import RoomFeature from './roomfeature';

export default class RoomTheme {
  name: string;
  environment: string;
  features: RoomFeature[];

  constructor(name: string, environment: string, features: RoomFeature[]) {
    this.name = name;
    this.environment = environment;
    this.features = features;
  }
}
