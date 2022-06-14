'use strict';

import RoomFeature from './feature';
import * as RND from '../../../random';

export default class RoomFeatureGenerator {
  name: string;
  descriptionOptions: string[];
  isContainer: boolean;

  constructor(name: string, descriptionOptions: string[], isContainer: boolean) {
    this.name = name;
    this.descriptionOptions = descriptionOptions;
    this.isContainer = isContainer;
  }

  generate(): RoomFeature {
    return new RoomFeature(this.name, RND.item(this.descriptionOptions), this.isContainer);
  }
}
