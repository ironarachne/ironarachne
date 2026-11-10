import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'tar slime',
  pluralName: 'tar slimes',
  adjective: 'tar slime',
  breedType: 'tar slime',
  environments: ['coastal', 'swamp', 'underdark', 'urban'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['asphalt black', 'jet', 'oil slick', 'ropey black', 'sulfur flecked'],
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
      name: 'tar trap',
      description: 'anchors feet and wheels in thick adhesive',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'flammable',
      description: 'open flame can set it alight',
      category: 'weakness',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [25, 75],
    length: [95, 195],
    mass: [105, 420],
  }),
  tags: ['ooze', 'tar slime'],
};
