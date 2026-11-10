import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'worg',
  pluralName: 'worgs',
  adjective: 'worg',
  breedType: 'worg',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fangs',
      category: 'fangs',
      options: ['hooked', 'crooked', 'large', 'sharp'],
      tags: ['fangs'],
    },
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'grey', 'white', 'brown', 'dark'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['pale', 'grey', 'black', 'brown'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'red', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [95, 140],
    length: [190, 290],
    mass: [105, 255],
  }),
  tags: ['worg', 'monstrosity'],
};
