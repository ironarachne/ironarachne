import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'tabaxi',
  pluralName: 'tabaxi',
  adjective: 'tabaxi',
  breedType: 'tabaxi',
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
      name: 'fur pattern',
      category: 'fur',
      options: ['marbled', 'solid black', 'solid sand', 'spotted', 'striped', 'ticked'],
      tags: ['fur'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'gold', 'green', 'yellow slit'],
      tags: ['eyes'],
    },
    {
      name: 'tail',
      category: 'body',
      options: ['long', 'plumed', 'slender', 'thick'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.1),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
    {
      name: 'agile climber',
      description: 'claws and balance suited to heights',
      category: 'movement',
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.0, 1.0),
  tags: ['corruptible', 'humanoid', 'magic', 'martial', 'sentient', 'tabaxi'],
};
