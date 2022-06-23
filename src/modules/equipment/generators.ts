'use strict';

import ItemGenerator from './itemgenerator';
import ItemGeneratorConfig from './itemgeneratorconfig';
import * as Patterns from './patterns/patterns';
import * as RND from '../random';

export function getItemGenerator(itemName: string, value: number): ItemGenerator {
  let itemGenConfig = new ItemGeneratorConfig();
  itemGenConfig.pattern = Patterns.byName(itemName);

  let minValue = 0;
  let maxValue = 10;

  if (value == 1) {
    maxValue = 20;
  } else if (value == 2) {
    minValue = 10;
    maxValue = 30;
  } else if (value == 3) {
    minValue = 30;
    maxValue = 50;
  } else if (value == 3) {
    minValue = 50;
    maxValue = 100;
  } else if (value == 4) {
    minValue = 100;
    maxValue = 10000;
  }

  itemGenConfig.minValue = minValue;
  itemGenConfig.maxValue = maxValue;

  let itemGen = new ItemGenerator(itemGenConfig);

  return itemGen;
}

export function getItemGeneratorByTag(tag: string, value: number): ItemGenerator {
  let patternOptions = Patterns.forCategory(tag);

  return getItemGenerator(RND.item(patternOptions).name, value);
}
