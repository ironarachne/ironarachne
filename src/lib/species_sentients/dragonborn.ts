import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

let ageCategories = AgeCategories.getHumanVariant(0.8);

export default <Species>{
  name: 'dragonborn',
  pluralName: 'dragonborn',
  adjective: 'dragonborn',
  breedType: 'dragonborn',
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
      name: 'crest',
      category: 'crest',
      options: ['finned', 'horned', 'ridged', 'spiked', 'spined', 'webbed'],
      tags: ['crest'],
    },
    {
      name: 'scales',
      category: 'skin',
      options: [
        'amethyst',
        'black',
        'blue',
        'brass',
        'bronze',
        'copper',
        'crystal',
        'emerald',
        'gold',
        'green',
        'red',
        'sapphire',
        'silver',
        'topaz',
        'white',
      ],
      tags: ['scales', 'skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'dark', 'green', 'orange', 'red', 'turquoise', 'white', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: ageCategories,
  baseThreatLevel: 2,
  abilities: [
    {
      name: 'breath weapon',
      description:
        "can breathe an element (acid, cold, fire, lightning, poison) appropriate to the dragonborn's type",
      category: 'attack',
    },
  ],
  commonality: 10,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.7, 1.1),
  tags: ['corruptible', 'dragonborn', 'dragonkin', 'martial', 'sentient', 'magic', 'humanoid'],
};
