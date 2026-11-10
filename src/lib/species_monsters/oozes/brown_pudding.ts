import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'brown pudding',
  pluralName: 'brown puddings',
  adjective: 'brown pudding',
  breedType: 'brown pudding',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['brown', 'russet', 'dark brown'],
      tags: ['body'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'amorphous',
      description: 'can squeeze through small spaces',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'climb walls and ceilings',
      description: 'can climb walls and ceilings',
      category: 'movement',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [40, 100],
    length: [145, 265],
    mass: [260, 950],
  }),
  tags: ['brown pudding', 'ooze'],
};
