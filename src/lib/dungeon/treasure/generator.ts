import * as RNG from "@ironarachne/rng";
import type Item from "../../equipment/item.js";
import TreasureGeneratorConfig from "./generatorconfig.js";

export default class TreasureResultGenerator {
  config: TreasureGeneratorConfig;

  constructor(config: TreasureGeneratorConfig) {
    this.config = config;
  }

  generate(): Item[] {
    let result: Item[] = [];

    for (const table of this.config.tables) {
      let possibleItems = table.entries;

      let t = this.config.rng.weighted(possibleItems);
      let gen = t.generator;
      let items = gen.generate();

      result = result.concat(items);
    }

    return result;
  }
}
