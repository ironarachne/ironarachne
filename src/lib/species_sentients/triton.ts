import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'triton',
  pluralName: 'tritons',
  adjective: 'triton',
  breedType: 'human',
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
      name: 'hair',
      category: 'hair',
      options: ['black', 'blue', 'deep green', 'seafoam', 'silver', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['aquamarine', 'blue', 'deep blue', 'pale blue', 'silver sheen', 'teal'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue', 'green', 'pearl', 'silver', 'teal'],
      tags: ['eyes'],
    },
    {
      name: 'fins',
      category: 'body',
      options: ['ear fins', 'forearm ridges', 'spinal crest', 'subtle'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.5),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'amphibious',
      description: 'breathes air and water with ease',
      category: 'trait',
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ['corruptible', 'humanoid', 'magic', 'martial', 'sentient', 'triton'],
};
