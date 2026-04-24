import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'smoke mephit',
  pluralName: 'smoke mephits',
  adjective: 'smoke mephit',
  breedType: 'smoke mephit',
  environments: ['desert', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['ash grey', 'black', 'charcoal', 'grey', 'soot black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['ember red', 'glowing orange', 'white hot', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'explodes into a choking smoke cloud on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'blinding smoke breath',
      description: 'exhales ash that burns eyes and lungs',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'cinder form',
      description: 'can shed minor heat without fuel',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'smoke mephit'],
};
