import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'blink dog',
  pluralName: 'blink dogs',
  adjective: 'blink dog',
  breedType: 'blink dog',
  environments: ['forest', 'mountain', 'underdark'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'grey', 'blue'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'pink', 'light', 'tan'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'blink',
      description: 'can teleport short distances',
      category: 'movement',
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['blink dog'],
};
