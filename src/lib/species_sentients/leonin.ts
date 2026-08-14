import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'leonin',
  pluralName: 'leonin',
  adjective: 'leonin',
  breedType: 'leonin',
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
      name: 'mane',
      category: 'fur',
      options: ['black', 'blonde', 'brown', 'golden', 'russet', 'tawny', 'white'],
      tags: ['fur'],
    },
    {
      name: 'fur',
      category: 'fur',
      options: ['dun', 'golden', 'sandy', 'short black', 'spotted', 'tawny'],
      tags: ['fur'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'gold', 'green', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'claws',
      description: 'retractable claws on hands',
      category: 'attack',
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.05, 1.05),
  tags: ['humanoid', 'leonin', 'martial', 'sentient'],
};
