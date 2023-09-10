import * as RND from "@ironarachne/rng";
import ItemGenerator from "./itemgenerator.js";
import ItemGeneratorConfig from "./itemgeneratorconfig.js";
import * as Patterns from "./patterns/patterns.js";

export function getItemGenerator(itemName: string, quality: number): ItemGenerator {
  let itemGenConfig = new ItemGeneratorConfig();
  itemGenConfig.pattern = Patterns.byName(itemName);

  let minValue = 0;
  let minQuality = quality;
  let maxValue = 10;
  let maxQuality = quality;

  if (quality == 1) {
    maxValue = 20;
  } else if (quality == 2) {
    minValue = 10;
    maxValue = 30;
  } else if (quality == 3) {
    minValue = 30;
    maxValue = 50;
  } else if (quality == 3) {
    minValue = 50;
    maxValue = 100;
  } else if (quality == 4) {
    minValue = 100;
    maxValue = 10000;
  }

  itemGenConfig.minValue = minValue;
  itemGenConfig.maxValue = maxValue;
  itemGenConfig.minQuality = minQuality;
  itemGenConfig.maxQuality = maxQuality;

  let itemGen = new ItemGenerator(itemGenConfig);

  return itemGen;
}

export function getItemGeneratorByTag(tag: string, quality: number): ItemGenerator {
  let patternOptions = Patterns.forCategory(tag);

  return getItemGenerator(RND.item(patternOptions).name, quality);
}
