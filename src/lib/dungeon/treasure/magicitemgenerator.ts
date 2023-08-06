"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import * as Currency from "../../currency/currency.js";
import type Item from "../../equipment/item.js";
import ItemGenerator from "../../equipment/itemgenerator.js";
import ItemGeneratorConfig from "../../equipment/itemgeneratorconfig.js";
import * as Patterns from "../../equipment/patterns/patterns.js";
import type TreasureGenerator from "./treasuregenerator.js";

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
