import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['rust monster', 'monstrosity'],
};
