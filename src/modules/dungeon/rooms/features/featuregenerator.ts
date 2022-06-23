'use strict';

import RoomFeature from './feature';
import * as RND from '../../../random';

export default class RoomFeatureGenerator {
  name: string;
  descriptionOptions: string[];
  secretOptions: string[];
  isContainer: boolean;

  constructor(
    name: string,
    descriptionOptions: string[],
    secretOptions: string[],
    isContainer: boolean,
  ) {
    this.name = name;
    this.descriptionOptions = descriptionOptions;
    this.secretOptions = secretOptions;
    this.isContainer = isContainer;
  }

  generate(): RoomFeature {
    let secret = '';

    if (RND.chance(100) > 70 && this.secretOptions.length > 0) {
      secret = RND.item(this.secretOptions);
    }

    return new RoomFeature(this.name, RND.item(this.descriptionOptions), secret, this.isContainer);
  }
}
