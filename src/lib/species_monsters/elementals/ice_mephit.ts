import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'ice mephit',
  pluralName: 'ice mephits',
  adjective: 'ice mephit',
  breedType: 'ice mephit',
  environments: ['arctic'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'mottled brown', 'tan', 'mottled tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['grey', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'spell: fog cloud',
      description: 'can cast fog cloud',
      category: 'spell',
      threatLevel: 2,
    },
    {
      name: 'ice explosion on death',
      description: 'explodes in ice shards on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'breath weapon: frost',
      description: 'can breathe frost',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'immunity: cold',
      description: 'is immune to cold',
      category: 'immunity',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [60, 90],
    length: [0, 0],
    mass: [10, 24],
  }),
  tags: ['elemental', 'ice mephit'],
};
