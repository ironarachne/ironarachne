import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'vitriolic ooze',
  pluralName: 'vitriolic oozes',
  adjective: 'vitriolic ooze',
  breedType: 'vitriolic ooze',
  environments: ['desert', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['bile yellow', 'chartreuse', 'sickly green', 'sulfur yellow', 'yellow-green'],
      tags: ['body'],
    },
  ],
  ageCategories,

  baseThreatLevel: 2,
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
      name: 'acid spray',
      description: 'splashes corrosive droplets when struck',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'caustic fumes',
      description: 'exudes vapors that sting eyes and lungs',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [20, 65],
    length: [100, 220],
    mass: [70, 360],
  }),
  tags: ['ooze', 'vitriolic ooze'],
};
