'use strict';

import ItemGeneratorConfig from './itemgeneratorconfig';
import type Item from './item';
import * as Components from '../equipment/components/components';
import * as RND from '../random';
import * as Mutators from './mutators/mutators';
import random from 'random';

export default class ItemGenerator {
  config: ItemGeneratorConfig;

  constructor(config: ItemGeneratorConfig) {
    this.config = config;
  }

  generate(): Item {
    let quality = random.int(this.config.minQuality, this.config.maxQuality);
    let components = Components.withMaxQuality(this.config.maxQuality, this.config.components);
    components = Components.withMinQuality(this.config.minQuality, components);
    let item = this.config.pattern.complete(this.config.components, quality);

    if (this.config.useMutator) {
      let mutators = Mutators.withAnyTag(item.tags, this.config.mutators);
      if (mutators.length > 0) {
        let mutator = RND.item(mutators);
        item = mutator.mutate(item);
      }
    }

    return item;
  }
}
