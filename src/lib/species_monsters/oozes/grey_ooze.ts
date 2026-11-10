import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'grey ooze',
  pluralName: 'grey oozes',
  adjective: 'grey ooze',
  breedType: 'grey ooze',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['grey', 'dark grey', 'light grey'],
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
    {
      name: 'corrode metal',
      description: 'corrode metal',
      category: 'misc',
      threatLevel: 1,
    },
    {
      name: 'imitate oily pool',
      description: 'imitate oily pool',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [10, 40],
    length: [95, 195],
    mass: [50, 210],
  }),
  tags: ['grey ooze', 'ooze'],
};
