import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'salt mephit',
  pluralName: 'salt mephits',
  adjective: 'salt mephit',
  breedType: 'salt mephit',
  environments: ['coastal', 'desert'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['bone white', 'chalk', 'cracked white', 'grey', 'sea salt white'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'blue', 'grey', 'pale green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'shatters into stinging salt crystals on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'brine breath',
      description: 'sprays hyper-saline brine that dries and stings',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'desiccating aura',
      description: 'nearby moisture wicks away faster than natural',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'salt mephit'],
};
