import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'quasit',
  pluralName: 'quasits',
  adjective: 'quasit',
  breedType: 'quasit',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'mottled brown', 'olive', 'mottled green'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['grey', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'shapeshift into insect',
      description: 'can shapeshift into an insect',
      category: 'shapeshift',
      threatLevel: 2,
    },
    {
      name: 'minor invisibility',
      description: 'can turn invisible at will, but not while attacking',
      category: 'invisibility',
      threatLevel: 2,
    },
    {
      name: 'resistance: magic',
      description: 'is resistant to magic',
      category: 'resistance',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'quasit'],
};
