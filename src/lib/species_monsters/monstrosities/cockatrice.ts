import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'cockatrice',
  pluralName: 'cockatrices',
  adjective: 'cockatrice',
  breedType: 'cockatrice',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'wings',
      category: 'wings',
      options: ['striped', 'short', 'broad'],
      tags: ['wings'],
    },
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'grey', 'red', 'brown'],
      tags: ['feathers'],
    },
    {
      name: 'scales',
      category: 'scales',
      options: ['black', 'russet', 'red', 'brown'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'orange', 'red', 'brown'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'venomous bite',
      description: 'can bite with venom',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [45, 65],
    length: [75, 115],
    mass: [7, 16],
  }),
  tags: ['cockatrice', 'monstrosity'],
};
