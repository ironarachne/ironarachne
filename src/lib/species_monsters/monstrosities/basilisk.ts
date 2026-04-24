import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['basilisk', 'monstrosity'],
};
