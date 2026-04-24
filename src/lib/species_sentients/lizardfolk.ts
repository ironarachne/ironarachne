import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'lizardfolk',
  pluralName: 'lizardfolk',
  adjective: 'lizardfolk',
  breedType: 'lizardfolk',
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
      name: 'scales',
      category: 'scales',
      options: ['black', 'brown', 'emerald', 'grey-green', 'mottled', 'sand', 'turquoise'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'gold', 'slit yellow', 'teal'],
      tags: ['eyes'],
    },
    {
      name: 'crest',
      category: 'body',
      options: ['dorsal spines', 'frill', 'none', 'small ridge'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'hold breath',
      description: 'can hold breath for many minutes',
      category: 'trait',
    },
    {
      name: 'bite',
      description: 'jaws suited to tearing',
      category: 'attack',
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.0, 1.0),
  tags: ['humanoid', 'lizardfolk', 'martial', 'sentient'],
};
