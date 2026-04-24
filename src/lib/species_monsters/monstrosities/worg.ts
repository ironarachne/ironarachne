import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'worg',
  pluralName: 'worgs',
  adjective: 'worg',
  breedType: 'worg',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fangs',
      category: 'fangs',
      options: ['hooked', 'crooked', 'large', 'sharp'],
      tags: ['fangs'],
    },
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'grey', 'white', 'brown', 'dark'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['pale', 'grey', 'black', 'brown'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'red', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['worg', 'monstrosity'],
};
