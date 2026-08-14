import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'goblin',
  pluralName: 'goblins',
  adjective: 'goblin',
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
  creatureTypes: ['humanoid', 'goblinoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'blonde', 'brown', 'dark', 'light', 'red', 'russet'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['green', 'grey', 'pale', 'dark green', 'brown'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'red', 'brown', 'dark', 'orange'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.15),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 15,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.5, 0.6),
  tags: ['goblin', 'greenskin', 'martial', 'sentient', 'humanoid'],
};
