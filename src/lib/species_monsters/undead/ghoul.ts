import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'ghoul',
  pluralName: 'ghouls',
  adjective: 'ghoul',
  breedType: 'ghoul',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fangs',
      category: 'fangs',
      options: ['hooked', 'crooked', 'large', 'sharp'],
      tags: ['fangs'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['pale', 'pallid', 'grey', 'light grey'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'red', 'yellow', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [135, 180],
    length: [0, 0],
    mass: [35, 73],
  }),
  tags: ['ghoul', 'undead'],
};
