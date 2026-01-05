import type { RNG } from '@ironarachne/rng';
import type PhysicalTrait from './physical_trait';
import type PhysicalTraitGeneratorConfig from './physical_trait_generator_config';

export function generate(config: PhysicalTraitGeneratorConfig, rng: RNG): PhysicalTrait {
  let name = config.name;
  let category = config.category;
  let tags = config.tags;
  let description = `${rng.item(config.options)} ${config.name}`;

  return {
    name,
    description,
    category,
    tags,
  };
}
