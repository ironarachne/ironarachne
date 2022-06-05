'use strict';

import type { Item } from '../../equipment/item';
import TreasureGeneratorConfig from './generatorconfig';
import * as RND from '../../random';

export default class TreasureResultGenerator {
  config: TreasureGeneratorConfig;

  constructor(config: TreasureGeneratorConfig) {
    this.config = config;
  }

  generate(): Item {
    let possibleItems = this.config.table;

    let t = RND.weighted(possibleItems);
    let gen = t.generator;
    let item = gen.generate();

    return item;
  }
}
