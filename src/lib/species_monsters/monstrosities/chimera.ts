import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'chimera',
  pluralName: 'chimeras',
  adjective: 'chimera',
  breedType: 'chimera',
  environments: ['grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'lion pelt',
      category: 'fur',
      options: ['black', 'brown', 'golden', 'sand', 'tawny'],
      tags: ['fur'],
    },
    {
      name: 'goat hide',
      category: 'skin',
      options: ['black', 'brown', 'grey', 'white'],
      tags: ['skin'],
    },
    {
      name: 'dragon scales',
      category: 'scales',
      options: ['blue', 'bronze', 'green', 'red', 'white'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'gold', 'green', 'red', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'flight',
      description: 'dragon wings carry it aloft',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'breath weapon: fire',
      description: 'dragon head exhales a cone of flame',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'threefold bite',
      description: 'lion, goat, and wyrm heads strike in turn',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['chimera', 'monstrosity'],
};
