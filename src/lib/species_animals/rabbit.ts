import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'rabbit',
  pluralName: 'rabbits',
  adjective: 'rabbit',
  breedType: 'rabbit',
  environments: ['forest', 'grassland', 'hill', 'urban'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'dark', 'grey', 'tan', 'white'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'brown', 'pink', 'light', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 10,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['rabbit', 'lagomorph'],
};
