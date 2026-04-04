import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '../species.js';

export default <Species>{
  name: 'duergar',
  pluralName: 'duergar',
  adjective: 'duergar',
  breedType: 'human',
  environments: ['underdark'],
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
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1, 0.75),
  tags: ['corruptible', 'duergar', 'dwarf', 'martial', 'sentient', 'humanoid'],
};
