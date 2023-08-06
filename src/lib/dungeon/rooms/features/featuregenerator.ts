"use strict";

import * as RND from "@ironarachne/rng";
import RoomFeature from "./feature.js";

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
    let secret = "";

    if (RND.simple(100) > 70 && this.secretOptions.length > 0) {
      secret = RND.item(this.secretOptions);
    }

    return new RoomFeature(this.name, RND.item(this.descriptionOptions), secret, this.isContainer);
  }
}
