import type { RNG } from '@ironarachne/rng';

import * as Components from './components/components.js';
import type Item from './item.js';
import type ItemGeneratorConfig from './itemgeneratorconfig.js';
import * as Mutators from './mutators/mutators.js';

export default class ItemGenerator {
  config: ItemGeneratorConfig;
  rng: RNG;

  constructor(config: ItemGeneratorConfig, rng: RNG) {
    this.config = config;
    this.rng = rng;
  }

  generate(): Item {
    let quality = this.rng.int(this.config.minQuality, this.config.maxQuality);
    let components = Components.withMaxQuality(this.config.maxQuality, this.config.components);
    components = Components.withMinQuality(this.config.minQuality, components);
    let item = this.config.pattern.complete(this.config.components, quality, this.rng);

    if (this.config.useMutator) {
      let mutators = Mutators.withAnyTag(item.tags, this.config.mutators);
      if (mutators.length > 0) {
        let mutator = this.rng.item(mutators);
        item = mutator.mutate(item);
      }
    }

    return item;
  }
}
