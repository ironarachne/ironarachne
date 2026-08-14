import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'dwarf',
  pluralName: 'dwarves',
  adjective: 'dwarven',
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
  creatureTypes: ['humanoid', 'dwarf'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['dark', 'black', 'russet', 'brown', 'red'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['grey', 'blue-grey', 'dark grey', 'light grey'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'red', 'dark', 'amber'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(3),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 20,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1, 0.75),
  tags: ['corruptible', 'dwarf', 'martial', 'sentient', 'humanoid'],
};
