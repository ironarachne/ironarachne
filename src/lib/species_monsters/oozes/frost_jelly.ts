import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'frost jelly',
  pluralName: 'frost jellies',
  adjective: 'frost jelly',
  breedType: 'frost jelly',
  environments: ['arctic', 'mountain', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['blue-white', 'clear ice', 'glacial blue', 'hoarfrost', 'pale cyan'],
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
      name: 'numbing chill',
      description: 'contact steals warmth and slows movement',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'shatter when heated',
      description: 'sudden fire can crack its matrix',
      category: 'weakness',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['frost jelly', 'ooze'],
};
