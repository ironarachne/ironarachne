import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'elf',
  pluralName: 'elves',
  adjective: 'elven',
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
  creatureTypes: ['humanoid', 'elf'],
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
      options: ['tan', 'light', 'bronzed', 'white', 'pale'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue', 'green', 'brown', 'dark', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(7),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
    {
      name: 'trance',
      description: 'can meditate instead of sleeping',
      category: 'senses',
    },
    {
      name: 'immunity: sleep',
      description: 'cannot be put to sleep by magic',
      category: 'immunity',
    },
  ],
  commonality: 30,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.6, 0.9),
  tags: ['corruptible', 'elf', 'martial', 'magic', 'sentient', 'humanoid'],
};
