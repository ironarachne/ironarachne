import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ firstStageName: 'hatchling' });
const genders = traditional();

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
  ageCategories,

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [200, 280],
    length: [220, 320],
    mass: [140, 280],
  }),
  tags: ['axe beak'],
};
