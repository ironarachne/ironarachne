import * as RND from "@ironarachne/rng";
import random from "random";
import * as Components from "./components/components.js";
import type Item from "./item.js";
import type ItemGeneratorConfig from "./itemgeneratorconfig.js";
import * as Mutators from "./mutators/mutators.js";

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
