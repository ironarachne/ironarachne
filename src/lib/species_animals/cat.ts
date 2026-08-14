import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'cat',
  pluralName: 'cats',
  adjective: 'cat',
  breedType: 'cat',
  environments: ['desert', 'forest', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: [
        'black',
        'brown',
        'tan',
        'grey',
        'white',
        'calico',
        'tortoiseshell',
        'ginger',
        'mottled',
        'striped',
        'spotted',
      ],
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
      options: ['amber', 'brown', 'dark', 'green', 'blue'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanCat(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['cat'],
};
