import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'magma mephit',
  pluralName: 'magma mephits',
  adjective: 'magma mephit',
  breedType: 'magma mephit',
  environments: ['underdark'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['red', 'mottled red', 'black', 'mottled black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['red', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'spell: heat metal',
      description: 'can cast heat metal',
      category: 'spell',
      threatLevel: 1,
    },
    {
      name: 'lava explosion on death',
      description: 'explodes in lava on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'breath weapon: fire',
      description: 'can breathe fire',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'immunity: fire',
      description: 'is immune to fire',
      category: 'immunity',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [65, 95],
    length: [0, 0],
    mass: [23, 55],
  }),
  tags: ['elemental', 'magma mephit'],
};
