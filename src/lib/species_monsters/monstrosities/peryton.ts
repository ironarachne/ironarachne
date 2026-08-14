import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'peryton',
  pluralName: 'perytons',
  adjective: 'peryton',
  breedType: 'peryton',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'blue-black', 'brown', 'iridescent green', 'storm grey'],
      tags: ['feathers'],
    },
    {
      name: 'antlers',
      category: 'body',
      options: ['forked', 'heavy', 'jagged', 'sweeping'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'blood red', 'ice blue', 'void'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'flight',
      description: 'can fly with avian speed',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'dive',
      description: 'stoops from above with antlers and talons',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'shadow cast',
      description: 'its shadow resembles a human outline',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['monstrosity', 'peryton'],
};
