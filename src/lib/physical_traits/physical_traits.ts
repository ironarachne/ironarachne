import type { RNG } from '@ironarachne/rng';
import type PhysicalTrait from './physical_trait';
import type PhysicalTraitGeneratorConfig from './physical_trait_generator_config';

export function add_trait(trait: PhysicalTrait, traits: PhysicalTrait[]): PhysicalTrait[] {
  // Add the new trait to the existing traits, replacing any trait in the same category
  const filteredTraits = traits.filter((t) => t.category !== trait.category);
  return [...filteredTraits, trait];
}

export function generate(config: PhysicalTraitGeneratorConfig, rng: RNG): PhysicalTrait {
  const name = config.name;
  const category = config.category;
  const tags = config.tags;
  const description = `${rng.item(config.options)} ${config.name}`;

  return {
    name,
    description,
    category,
    tags,
  };
}
