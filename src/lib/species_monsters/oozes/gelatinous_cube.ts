import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'gelatinous cube',
  pluralName: 'gelatinous cubes',
  adjective: 'gelatinous cube',
  breedType: 'gelatinous cube',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['clear', 'translucent', 'foggy'],
      tags: ['body'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'nonmetal dissolution',
      description: 'dissolve nonmagical nonmetal things',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [280, 320],
    length: [280, 320],
    mass: [18000, 33000],
  }),
  tags: ['gelatinous cube', 'ooze'],
};
