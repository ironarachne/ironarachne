import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'dust mephit',
  pluralName: 'dust mephits',
  adjective: 'dust mephit',
  breedType: 'dust mephit',
  environments: ['desert'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'mottled brown', 'tan', 'mottled tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['grey', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'death burst',
      description: 'explodes on death',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'blinding dust breath',
      description: 'blinds enemies',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'dust mephit'],
};
