import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'manticore',
  pluralName: 'manticores',
  adjective: 'manticore',
  breedType: 'manticore',
  environments: ['desert', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'mane',
      category: 'fur',
      options: ['black', 'blood red', 'brown', 'golden', 'iron grey'],
      tags: ['fur'],
    },
    {
      name: 'hide',
      category: 'skin',
      options: ['red', 'rust', 'sand', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'wings',
      category: 'wings',
      options: ['bat-like', 'broad', 'mottled', 'tattered tips'],
      tags: ['wings'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'red', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'flight',
      description: 'can fly on leathery wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'tail spikes',
      description: 'launches barbed spines in a volley',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [135, 190],
    length: [290, 440],
    mass: [240, 560],
  }),
  tags: ['manticore', 'monstrosity'],
};
