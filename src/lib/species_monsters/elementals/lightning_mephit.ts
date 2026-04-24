import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'lightning mephit',
  pluralName: 'lightning mephits',
  adjective: 'lightning mephit',
  breedType: 'lightning mephit',
  environments: ['coastal', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['blue-white', 'deep blue', 'grey', 'silver', 'violet white'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['arc white', 'blue', 'purple', 'white'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'arcs lightning to nearby metal and flesh on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'shocking breath',
      description: 'exhales a jagged line of sparks',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'immunity: lightning',
      description: 'is immune to lightning damage',
      category: 'immunity',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'lightning mephit'],
};
