import type { PlantDefinition } from './biological_source_types';
import { getBiologicalHabitatRules } from './biological_habitats';

const entries: [string, string, string[]][] = [
  ['common-reed', 'common reed', ['reed-margin']],
  ['papyrus', 'papyrus', ['papyrus-margin']],
  ['flax', 'flax', ['temperate-field']],
  ['cotton', 'cotton', ['warm-field']],
  ['hemp', 'fiber hemp', ['temperate-field']],
  ['nettle', 'common nettle', ['temperate-edge']],
  ['wheat', 'wheat', ['temperate-field']],
  ['barley', 'barley', ['temperate-field']],
  ['oat', 'oat', ['cool-field']],
  ['rye', 'cereal rye', ['cool-field']],
  ['lentil', 'lentil', ['temperate-field']],
  ['pea', 'garden pea', ['cool-field']],
  ['apple', 'orchard apple', ['temperate-orchard']],
  ['pear', 'orchard pear', ['temperate-orchard']],
  ['plum', 'orchard plum', ['temperate-orchard']],
  ['olive', 'cultivated olive', ['warm-orchard']],
  ['grape', 'cultivated grape', ['warm-orchard']],
  ['hazel', 'European hazel', ['temperate-woodland', 'temperate-orchard']],
  ['walnut', 'English walnut', ['temperate-orchard']],
  ['sweet-chestnut', 'sweet chestnut', ['temperate-woodland', 'temperate-orchard']],
  ['turnip', 'turnip', ['cool-field']],
  ['garden-carrot', 'garden carrot', ['cool-field']],
  ['cabbage', 'cabbage', ['cool-field']],
  ['bulb-onion', 'bulb onion', ['temperate-field']],
  ['spearmint', 'spearmint', ['temperate-field']],
  ['thyme', 'culinary thyme', ['dry-herb']],
  ['purple-willow', 'purple willow', ['wet-willow']],
  ['yarrow', 'yarrow', ['temperate-edge']],
  ['calendula', 'calendula', ['temperate-field']],
  ['woad', 'woad', ['temperate-field']],
  ['madder', 'madder', ['temperate-field']],
  ['weld', 'weld', ['temperate-field']],
  ['maritime-pine', 'maritime pine', ['pine-woodland']],
  ['english-oak', 'English oak', ['temperate-woodland']],
  ['perennial-ryegrass', 'perennial ryegrass', ['temperate-edge']],
  ['white-clover', 'white clover', ['temperate-edge']],
];
const aliases: Record<string, string[]> = {
  'common-reed': ['reed', 'reeds'],
  flax: [],
  papyrus: [],
};

/** Crop forms and species-specific identities never resolve from ambiguous generic flora prose. */
export function getPlantDefinitions(): PlantDefinition[] {
  return entries
    .map(
      ([id, label, profiles]): PlantDefinition => ({
        id,
        label,
        aliases: [...(aliases[id] ?? [])],
        habitats: profiles.flatMap(getBiologicalHabitatRules),
        forage:
          id === 'perennial-ryegrass' ? ['grazing'] : id === 'white-clover' ? ['flowering'] : [],
      }),
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function resolvePlantDefinition(identity: string): PlantDefinition | undefined {
  return getPlantDefinitions().find(
    (plant) =>
      plant.id === identity || plant.label === identity || plant.aliases.includes(identity),
  );
}
