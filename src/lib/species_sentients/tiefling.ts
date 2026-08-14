import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

const hornLengths = ['short', 'long'];
const hornTypes = ['curved', 'straight', 'curled', 'spiraled'];
const hornAppearances = [];
for (let j = 0; j < hornTypes.length; j++) {
  for (let i = 0; i < hornLengths.length; i++) {
    hornAppearances.push(`${hornLengths[i]} and ${hornTypes[j]}`);
  }
  hornAppearances.push(hornTypes[j]);
}

export default <Species>{
  name: 'tiefling',
  pluralName: 'tieflings',
  adjective: 'tiefling',
  breedType: 'human',
  environments: [
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'urban',
    'underdark',
  ],
  creatureTypes: ['humanoid', 'demonic'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: [
        'black',
        'brown',
        'dark',
        'red',
        'russet',
        'blue',
        'dark blue',
        'dark red',
        'dark purple',
        'purple',
      ],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: [
        'tan',
        'light',
        'bronzed',
        'white',
        'pale',
        'red',
        'purple',
        'blue',
        'ochre',
        'yellow',
        'brown',
        'black',
      ],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'red', 'white', 'silver', 'gold', 'blue', 'green'],
      tags: ['eyes'],
    },
    {
      name: 'horns',
      category: 'horns',
      options: hornAppearances,
      tags: ['horns'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 10,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.2, 1.0),
  tags: ['corruptible', 'tiefling', 'demonic', 'martial', 'magic', 'sentient', 'humanoid'],
};
