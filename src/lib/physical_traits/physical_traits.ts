import * as RND from "@ironarachne/rng";
import type PhysicalTrait from "./physical_trait";
import type PhysicalTraitGeneratorConfig from "./physical_trait_generator_config";

export function generate(config: PhysicalTraitGeneratorConfig): PhysicalTrait {
  let name = config.name;
  let category = config.category;
  let tags = config.tags;
  let description = RND.item(config.options) + " " + config.name;

  return {
    name,
    description,
    category,
    tags,
  };
}
