import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'fire beetle',
  pluralName: 'fire beetles',
  adjective: 'fire beetle',
  breedType: 'fire beetle',
  environments: ['forest', 'underdark'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['red', 'mottled red', 'black', 'mottled black'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['red', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'illumination',
      description: 'glows with soft orange light',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [25, 45],
    length: [60, 105],
    mass: [9, 25],
  }),
  tags: ['insect', 'fire beetle', 'beetle'],
};
