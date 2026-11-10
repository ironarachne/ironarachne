import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'salamander',
  pluralName: 'salamanders',
  adjective: 'salamander',
  breedType: 'salamander',
  environments: ['forest', 'mountain', 'swamp', 'underdark'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'brown', 'dark', 'green', 'olive', 'tan', 'yellow'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'brown', 'gold'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 0,
  abilities: [],
  commonality: 7,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [0, 0],
    length: [8, 25],
    mass: [0.006, 0.1],
  }),
  tags: ['salamander', 'amphibian'],
};
