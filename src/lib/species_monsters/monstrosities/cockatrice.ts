import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['cockatrice', 'monstrosity'],
};
