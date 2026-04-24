import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'nalfeshnee',
  pluralName: 'nalfeshnees',
  adjective: 'nalfeshnee',
  breedType: 'nalfeshnee',
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

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'aura of greed',
      description: 'fills foes with crippling avarice and doubt',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'flight',
      description: 'can fly on broad wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'spell: conjure obstacle',
      description: 'can manifest barbs, pits, or snares',
      category: 'spell',
      threatLevel: 2,
    },
  ],
  commonality: 1,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'nalfeshnee'],
};
