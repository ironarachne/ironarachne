import * as Sizes from '$lib/size/sizes.js';
import type Species from '../species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'imp',
  pluralName: 'imps',
  adjective: 'imp',
  breedType: 'imp',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'mottled brown', 'olive', 'black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing orange', 'glowing red'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'shapeshift into animal',
      description: 'can shapeshift into an animal',
      category: 'shapeshift',
      threatLevel: 2,
    },
    {
      name: 'darkvision',
      description: 'can see in darkness',
      category: 'senses',
      threatLevel: 1,
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
  tags: ['demon', 'fiend', 'imp'],
};
