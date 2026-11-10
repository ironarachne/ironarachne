import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'water elemental',
  pluralName: 'water elementals',
  adjective: 'water elemental',
  breedType: 'water elemental',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'swamp'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['breaker wave', 'creek swirl', 'rain veil', 'standing pool', 'tidal surge'],
      tags: ['body'],
    },
    {
      name: 'depth',
      category: 'eyes',
      options: ['black', 'blue-green', 'deep blue', 'grey-green', 'sea glass'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'engulf',
      description: 'can surround a creature in crushing water',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'flow through cracks',
      description: 'can pour through gaps too small for solid bodies',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'freeze vulnerability',
      description: 'partial freezing can slow or shatter its form',
      category: 'weakness',
      threatLevel: 1,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [235, 370],
    length: [155, 260],
    mass: [450, 1600],
  }),
  tags: ['elemental', 'water elemental'],
};
