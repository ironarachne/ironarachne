'use strict';

import type Item from '../../equipment/item';
import type TreasureGenerator from './treasuregenerator';
import * as Currency from '../../currency/currency';
import * as Patterns from '../../equipment/patterns/patterns';
import * as RND from '../../random';
import * as Words from '../../words';
import ItemGenerator from '../../equipment/itemgenerator';
import ItemGeneratorConfig from '../../equipment/itemgeneratorconfig';

export default class MagicItemGenerator implements TreasureGenerator {
  minValue: number;
  maxValue: number;
  count: number;

  constructor(min: number, max: number, count: number) {
    this.minValue = min;
    this.maxValue = max;
    this.count = count;
  }

  generate(): Item[] {
    let items = [];
    let possibleItems = Patterns.all();

    for (let i = 0; i < this.count; i++) {
      let itemGenConfig = new ItemGeneratorConfig();
      itemGenConfig.pattern = RND.item(possibleItems);
      itemGenConfig.useMutator = true;
      itemGenConfig.minQuality = 2;
      itemGenConfig.maxQuality = 5;
      itemGenConfig.minValue = this.minValue;
      itemGenConfig.maxValue = this.maxValue;
      let itemGen = new ItemGenerator(itemGenConfig);
      let item = itemGen.generate();

      let worth = Currency.valueToCoins(item.value, false, false, false);

      item.description = `${Words.article(item.name)} ${item.name} worth ${worth}`;

      items.push(item);
    }

    return items;
  }
}
