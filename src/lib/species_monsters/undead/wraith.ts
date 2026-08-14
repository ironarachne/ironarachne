import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'wraith',
  pluralName: 'wraiths',
  adjective: 'wraith',
  breedType: 'wraith',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'underdark', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: [
        'hooded mass',
        'howling wind',
        'ink-black cloak',
        'shredded mantle',
        'void silhouette',
      ],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue flame', 'cold stars', 'red embers', 'white pits', 'yellow balefire'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'incorporeal',
      description: 'flows through bars and blades alike',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'constitution drain',
      description: 'touch withers health that does not recover easily',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'create spawn',
      description: 'a victim slain by its chill may rise as a lesser spirit',
      category: 'misc',
      threatLevel: 3,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['undead', 'wraith'],
};
