import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '../species.js';

export default <Species>{
  name: 'deep gnome',
  pluralName: 'deep gnomes',
  adjective: 'deep gnome',
  breedType: 'human',
  environments: ['forest', 'mountain', 'underdark'],
  creatureTypes: ['humanoid', 'gnome'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'dark', 'light', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['grey', 'dark grey', 'pale', 'light grey', 'bone white'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'brown', 'dark', 'white'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(5),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses'
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.5, 0.5),
  tags: ['corruptible', 'deep gnome', 'gnome', 'martial', 'magic', 'sentient', 'humanoid'],
};
