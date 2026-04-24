import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'hezrou',
  pluralName: 'hezrous',
  adjective: 'hezrou',
  breedType: 'hezrou',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'blue-black', 'mottled brown', 'olive', 'red', 'slick black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing green', 'glowing orange', 'glowing red', 'void black'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'stench',
      description: 'aura of nausea weakens nearby creatures',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'swamp stride',
      description: 'moves unhindered through bog and mire',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'resistance: poison',
      description: 'is resistant to poison',
      category: 'resistance',
      threatLevel: 1,
    },
  ],
  commonality: 1,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'hezrou'],
};
