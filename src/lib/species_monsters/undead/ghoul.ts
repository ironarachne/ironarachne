import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'ghoul',
  pluralName: 'ghouls',
  adjective: 'ghoul',
  breedType: 'ghoul',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fangs',
      category: 'fangs',
      options: ['hooked', 'crooked', 'large', 'sharp'],
      tags: ['fangs'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['pale', 'pallid', 'grey', 'light grey'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'red', 'yellow', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['ghoul', 'undead'],
};
