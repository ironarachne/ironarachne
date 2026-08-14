import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['undead', 'wight'],
};
