import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '../species.js';

export default <Species>{
  name: 'dark elf',
  pluralName: 'dark elves',
  adjective: 'dark elven',
  breedType: 'human',
  environments: ['forest', 'mountain', 'underdark'],
  creatureTypes: ['humanoid', 'elf'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['white', 'light grey', 'ashen', 'silver', 'blue-grey'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'jet black', 'dark grey', 'grey', 'light grey', 'blue-grey'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue', 'purple', 'brown', 'dark', 'amber', 'grey', 'red'],
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
      name: 'spell: faerie fire',
      description: 'can cast faerie fire',
      category: 'spell',
    },
    {
      name: 'spell: dancing lights',
      description: 'can cast dancing lights',
      category: 'spell',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.6, 0.9),
  tags: ['corruptible', 'dark elf', 'elf', 'martial', 'magic', 'sentient', 'humanoid'],
};
