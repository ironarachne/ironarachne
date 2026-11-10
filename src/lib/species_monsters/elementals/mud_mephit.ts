import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'mud mephit',
  pluralName: 'mud mephits',
  adjective: 'mud mephit',
  breedType: 'mud mephit',
  environments: ['forest', 'grassland', 'hill', 'swamp'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'brown', 'mottled brown', 'olive', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'dark', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'splashes scalding mud on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'mud breath',
      description: 'can hurl clinging mud that blinds and slows',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'mire camouflage',
      description: 'can hold still and resemble a mud clod or bog hummock',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [60, 90],
    length: [0, 0],
    mass: [15, 40],
  }),
  tags: ['elemental', 'mud mephit'],
};
