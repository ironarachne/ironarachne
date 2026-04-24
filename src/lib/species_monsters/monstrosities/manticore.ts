import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'manticore',
  pluralName: 'manticores',
  adjective: 'manticore',
  breedType: 'manticore',
  environments: ['desert', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'mane',
      category: 'fur',
      options: ['black', 'blood red', 'brown', 'golden', 'iron grey'],
      tags: ['fur'],
    },
    {
      name: 'hide',
      category: 'skin',
      options: ['red', 'rust', 'sand', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'wings',
      category: 'wings',
      options: ['bat-like', 'broad', 'mottled', 'tattered tips'],
      tags: ['wings'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'red', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'flight',
      description: 'can fly on leathery wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'tail spikes',
      description: 'launches barbed spines in a volley',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['manticore', 'monstrosity'],
};
