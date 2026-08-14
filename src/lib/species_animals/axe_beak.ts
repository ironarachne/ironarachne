import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'axe beak',
  pluralName: 'axe beaks',
  adjective: 'axe beak',
  breedType: 'axe beak',
  environments: ['forest', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['silver', 'brown', 'grey', 'olive'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['long', 'hooked', 'sharp', 'crooked'],
      tags: ['beak'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'pink', 'light', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ firstStageName: 'hatchling' }),

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['axe beak'],
};
