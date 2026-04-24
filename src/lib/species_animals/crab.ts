import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'crab',
  pluralName: 'crabs',
  adjective: 'crab',
  breedType: 'crab',
  environments: ['coastal', 'swamp', 'urban'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'carapace',
      category: 'shell',
      options: ['black', 'brown', 'dark', 'green', 'red'],
      tags: ['shell'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'brown'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 10,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['crab', 'crustacean'],
};
