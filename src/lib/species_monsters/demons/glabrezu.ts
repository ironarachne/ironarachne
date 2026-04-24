import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'glabrezu',
  pluralName: 'glabrezus',
  adjective: 'glabrezu',
  breedType: 'glabrezu',
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
      name: 'true seeing',
      description: 'sees through illusions and many magical disguises',
      category: 'senses',
      threatLevel: 3,
    },
    {
      name: 'temptation',
      description: 'offers visions of desire to unbalance foes',
      category: 'misc',
      threatLevel: 3,
    },
    {
      name: 'pincer arms',
      description: 'massive claws can crush armor and bone',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 1,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'glabrezu'],
};
