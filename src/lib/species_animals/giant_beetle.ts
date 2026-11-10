import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'giant beetle',
  pluralName: 'giant beetles',
  adjective: 'giant beetle',
  breedType: 'giant beetle',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'urban', 'underdark'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['blue', 'brown', 'black', 'ochre'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [65, 110],
    length: [140, 220],
    mass: [65, 180],
  }),
  tags: ['insect', 'giant beetle', 'beetle'],
};
