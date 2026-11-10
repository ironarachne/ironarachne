import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'wight',
  pluralName: 'wights',
  adjective: 'wight',
  breedType: 'wight',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['blackened', 'corpse grey', 'leathery', 'mummified', 'withered'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue flame', 'cold white', 'pinprick red', 'void', 'yellow gleam'],
      tags: ['eyes'],
    },
    {
      name: 'attire',
      category: 'body',
      options: ['ancient armor', 'barrow rags', 'funeral silks', 'rotted finery', 'war gear'],
      tags: ['body'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'life drain',
      description: 'each blow steals the spark of the living',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'raise thralls',
      description: 'those it slays may rise as lesser undead servants',
      category: 'misc',
      threatLevel: 3,
    },
    {
      name: 'darkvision',
      description: 'can see in perfect darkness',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 2,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [145, 195],
    length: [0, 0],
    mass: [43, 90],
  }),
  tags: ['undead', 'wight'],
};
