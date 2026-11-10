import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'bison',
  pluralName: 'bison',
  adjective: 'bison',
  breedType: 'bison',
  environments: ['grassland', 'hill', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'dark', 'grey', 'tan', 'white'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'brown', 'pink', 'light', 'tan'],
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
  commonality: 6,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [150, 195],
    length: [240, 380],
    mass: [360, 950],
  }),
  tags: ['bison'],
};
