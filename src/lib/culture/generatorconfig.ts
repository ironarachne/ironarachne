import { getFantasyNameGeneratorSet, type NameGeneratorSet } from '$lib/names';
import * as RNG from '@ironarachne/rng';

export default class CultureGeneratorConfig {
  nameGeneratorSet: NameGeneratorSet;

  constructor() {
    this.nameGeneratorSet = getFantasyNameGeneratorSet('human', new RNG.RNG(Date.now()));
  }
}
