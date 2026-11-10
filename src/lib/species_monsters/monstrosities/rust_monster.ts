import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'rust monster',
  pluralName: 'rust monsters',
  adjective: 'rust monster',
  breedType: 'rust monster',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['red', 'russet', 'brown'],
      tags: ['body'],
    },
    {
      name: 'feelers',
      category: 'feelers',
      options: ['brown', 'ochre', 'tan', 'grey'],
      tags: ['feelers'],
    },
  ],
  ageCategories,

  baseThreatLevel: 0,
  abilities: [
    {
      name: 'rusting touch',
      description: 'rusts nonmagical metal it touches',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [55, 90],
    length: [115, 190],
    mass: [45, 125],
  }),
  tags: ['rust monster', 'monstrosity'],
};
