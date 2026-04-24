import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'manes',
  pluralName: 'manes',
  adjective: 'manes',
  breedType: 'manes',
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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 0,
  abilities: [
    {
      name: 'pack frenzy',
      description: 'gains courage in numbers',
      category: 'trait',
      threatLevel: 1,
    },
    {
      name: 'claws',
      description: 'rending claws',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'manes'],
};
