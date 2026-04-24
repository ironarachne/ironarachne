import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'giant centipede',
  pluralName: 'giant centipedes',
  adjective: 'giant centipede',
  breedType: 'giant centipede',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['red', 'black', 'brown'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['red', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'venomous bite',
      description: 'can bite with venom',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['insect', 'giant centipede', 'centipede'],
};
