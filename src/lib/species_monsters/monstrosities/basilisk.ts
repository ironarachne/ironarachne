import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'basilisk',
  pluralName: 'basilisks',
  adjective: 'basilisk',
  breedType: 'basilisk',
  environments: ['desert', 'forest', 'grassland', 'hill', 'mountain', 'swamp'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'scales',
      category: 'scales',
      options: ['brown', 'dun', 'mottled green', 'olive', 'stone grey'],
      tags: ['scales'],
    },
    {
      name: 'crest',
      category: 'body',
      options: ['bone spines', 'feathered ridge', 'frilled', 'stub horns'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['gold', 'green', 'milky', 'red', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'petrifying gaze',
      description: 'eye contact can stiffen flesh toward stone',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'venomous bite',
      description: 'bite carries corrosive venom',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 4,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [55, 85],
    length: [180, 280],
    mass: [100, 250],
  }),
  tags: ['basilisk', 'monstrosity'],
};
