import * as RNG from "@ironarachne/rng";
import type RoomFeature from "./feature.js";

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

    if (RNG.simple(100) > 70 && this.secretOptions.length > 0) {
      secret = RNG.item(this.secretOptions);
    }

    return {
      name: this.name,
      description: RNG.item(this.descriptionOptions),
      secret: secret,
      isContainer: this.isContainer,
    };
  }
}
