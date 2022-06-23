'use strict';

import type Item from '../../equipment/item';
import TreasureGeneratorConfig from './generatorconfig';
import * as RND from '../../random';

export default class TreasureResultGenerator {
  config: TreasureGeneratorConfig;

  constructor(config: TreasureGeneratorConfig) {
    this.config = config;
  }

  generate(): Item[] {
    let result = [];

    for (const table of this.config.tables) {
      let possibleItems = table.entries;

      let t = RND.weighted(possibleItems);
      let gen = t.generator;
      let items = gen.generate();

      result = result.concat(items);
    }

    return result;
  }
}
