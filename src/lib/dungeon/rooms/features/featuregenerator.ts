import type * as RNG from '@ironarachne/rng';
import type RoomFeature from './feature.js';

export default class RoomFeatureGenerator {
  name: string;
  descriptionOptions: string[];
  secretOptions: string[];
  isContainer: boolean;
  rng: RNG.RNG;

  constructor(
    name: string,
    descriptionOptions: string[],
    secretOptions: string[],
    isContainer: boolean,
    rng: RNG.RNG,
  ) {
    this.name = name;
    this.descriptionOptions = descriptionOptions;
    this.secretOptions = secretOptions;
    this.isContainer = isContainer;
    this.rng = rng;
  }

  generate(): RoomFeature {
    let secret = '';

    if (this.rng.int(1, 100) > 70 && this.secretOptions.length > 0) {
      secret = this.rng.item(this.secretOptions);
    }

    return {
      name: this.name,
      description: this.rng.item(this.descriptionOptions),
      secret: secret,
      isContainer: this.isContainer,
    };
  }
}
