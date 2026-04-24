import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'satyr',
  pluralName: 'satyrs',
  adjective: 'satyr',
  breedType: 'satyr',
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
  creatureTypes: ['fey', 'humanoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'brown', 'copper', 'curls', 'dark', 'red', 'wild'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['bronzed', 'olive', 'pale', 'tan', 'warm brown'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'brown', 'gold', 'green'],
      tags: ['eyes'],
    },
    {
      name: 'horns',
      category: 'horns',
      options: ['curled', 'knobbed', 'spiral', 'straight', 'twisted'],
      tags: ['horns'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.3),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'fey resilience',
      description: 'resists charms that snag mortals easily',
      category: 'trait',
    },
    {
      name: 'ramming charge',
      description: 'can strike with horns on a rush',
      category: 'attack',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.95, 1.0),
  tags: ['corruptible', 'fey', 'humanoid', 'magic', 'martial', 'satyr', 'sentient'],
};
