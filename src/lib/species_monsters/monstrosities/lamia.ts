import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'lamia',
  pluralName: 'lamias',
  adjective: 'lamia',
  breedType: 'lamia',
  environments: ['coastal', 'desert', 'forest', 'grassland', 'hill', 'urban'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'blonde', 'brown', 'copper', 'dark', 'red'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['bronzed', 'olive', 'pale', 'tan', 'warm brown'],
      tags: ['skin'],
    },
    {
      name: 'scales',
      category: 'scales',
      options: ['bronze', 'dun', 'green', 'sand', 'taupe'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'gold', 'green', 'serpent slit', 'violet'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'charm',
      description: 'voice and glance bend weaker wills',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'constrict',
      description: 'serpentine tail can crush a struggling foe',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'spell: illusion',
      description: 'weaves minor glamers over ruins and camps',
      category: 'spell',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [160, 235],
    length: [280, 420],
    mass: [230, 540],
  }),
  tags: ['lamia', 'monstrosity'],
};
