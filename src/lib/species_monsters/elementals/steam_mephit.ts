import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'steam mephit',
  pluralName: 'steam mephits',
  adjective: 'steam mephit',
  breedType: 'steam mephit',
  environments: ['underwater'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['red', 'mottled red', 'black', 'mottled black'],
      tags: ['skin'],
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
      name: 'spell: blur',
      description: 'can cast blur',
      category: 'spell',
      threatLevel: 1,
    },
    {
      name: 'steam explosion on death',
      description: 'explodes in steam on death',
      category: 'attack',
      threatLevel: 1,
    },
    {
      name: 'scalding steam breath',
      description: 'can breathe scalding steam',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'immunity: fire',
      description: 'is immune to fire',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'immunity: poison',
      description: 'is immune to poison',
      category: 'immunity',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'steam mephit'],
};
