import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['ooze', 'tar slime'],
};
