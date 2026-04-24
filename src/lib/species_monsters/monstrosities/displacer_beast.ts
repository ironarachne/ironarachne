import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'displacer beast',
  pluralName: 'displacer beasts',
  adjective: 'displacer beast',
  breedType: 'displacer beast',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['blue-black', 'charcoal', 'deep blue', 'midnight', 'steel blue'],
      tags: ['fur'],
    },
    {
      name: 'tentacles',
      category: 'body',
      options: ['knobbed', 'long', 'muscled', 'whip-thin'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['emerald', 'glowing green', 'pale blue', 'violet'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'displacement',
      description: 'appears a few feet from its true position',
      category: 'defense',
      threatLevel: 3,
    },
    {
      name: 'lashing tentacles',
      description: 'paired tentacles strike from the shoulders',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['displacer beast', 'monstrosity'],
};
