import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'mud mephit',
  pluralName: 'mud mephits',
  adjective: 'mud mephit',
  breedType: 'mud mephit',
  environments: ['forest', 'grassland', 'hill', 'swamp'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'brown', 'mottled brown', 'olive', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'dark', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'splashes scalding mud on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'mud breath',
      description: 'can hurl clinging mud that blinds and slows',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'mire camouflage',
      description: 'can hold still and resemble a mud clod or bog hummock',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'mud mephit'],
};
