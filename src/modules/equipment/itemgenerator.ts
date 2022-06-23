'use strict';

import ItemGeneratorConfig from './itemgeneratorconfig';
import type Item from './item';

export default class ItemGenerator {
  config: ItemGeneratorConfig;

  constructor(config: ItemGeneratorConfig) {
    this.config = config;
  }

  generate(): Item {
    return this.config.pattern.complete(
      this.config.components,
      this.config.minValue,
      this.config.maxValue,
    );
  }
}
