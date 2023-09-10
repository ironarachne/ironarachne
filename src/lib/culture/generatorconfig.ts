import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";

export default class CultureGeneratorConfig {
  generatorSet: MUN.GeneratorSet;

  constructor() {
    this.generatorSet = RND.item(MUN.cultureSets());
  }
}
