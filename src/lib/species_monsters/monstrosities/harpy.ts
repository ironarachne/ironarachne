import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'harpy',
  pluralName: 'harpies',
  adjective: 'harpy',
  breedType: 'harpy',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'wings',
      category: 'wings',
      options: ['striped', 'long', 'tapered'],
      tags: ['wings'],
    },
    {
      name: 'feathers',
      category: 'feathers',
      options: ['white', 'grey', 'silver', 'brown'],
      tags: ['feathers'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['white', 'black', 'tan', 'brown'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'blue', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'flight',
      description: 'can fly',
      category: 'movement',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['harpy', 'monstrosity'],
};
