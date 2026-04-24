import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'kenku',
  pluralName: 'kenku',
  adjective: 'kenku',
  breedType: 'kenku',
  environments: [
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'urban',
    'underdark',
  ],
  creatureTypes: ['humanoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'blue-black', 'brown', 'charcoal', 'mottled', 'rust'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['hooked', 'long', 'slate', 'weathered yellow'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark brown', 'red', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'mimicry',
      description: 'can replicate sounds and voices it has heard',
      category: 'misc',
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.85, 0.95),
  tags: ['corruptible', 'humanoid', 'kenku', 'magic', 'martial', 'sentient'],
};
