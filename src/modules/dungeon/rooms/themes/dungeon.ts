'use strict';

import RoomFeatureGenerator from '../features/featuregenerator';
import RoomTheme from './theme';

export function all(): RoomTheme[] {
  let genericFeatures = [
    new RoomFeatureGenerator(
      'debris',
      [
        'There is a pile of random debris here.',
        'Much of the floor is covered in debris.',
        'Debris of unknown origin is scattered about.',
      ],
      [],
      false,
    ),
    new RoomFeatureGenerator(
      'rags',
      [
        'There is a pile of rags here.',
        'One of the corners has a large pile of filthy rags.',
        'Small piles of rags are scattered across the floor.',
      ],
      [],
      false,
    ),
    new RoomFeatureGenerator(
      'cobwebs',
      [
        'There are a lot of cobwebs here.',
        'The ceiling is partly covered in cobwebs.',
        'Dense cobwebs hang down from the ceiling.',
      ],
      [],
      false,
    ),
  ];

  return [
    new RoomTheme(
      'altar room',
      [],
      3,
      3,
      10,
      10,
      ['marble', 'stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'altar',
          [
            'There is an evil-looking altar here.',
            'There is a blood-covered altar here.',
            'On top of a stone dais is a long altar.',
          ],
          [],
          false,
        ),
      ],
      ['rectangular'],
      ['cult'],
      5,
    ),
    new RoomTheme(
      'armory',
      [],
      3,
      3,
      6,
      6,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'weapon racks',
          [
            'Weapon racks full of old spears, swords, and axes line the walls.',
            'Each wall has at least one wooden rack full of weapons.',
            'There are rows of weapon racks here.',
          ],
          [],
          false,
        ),
        new RoomFeatureGenerator(
          'armor displays',
          [
            'Pieces of armor in various states of disrepair hang from pegs on the walls.',
            'There are numerous pegs on the walls for armor to be hung.',
            'Several pieces of armor are on armor stands here.',
          ],
          [],
          false,
        ),
      ],
      ['rectangular', 'square'],
      ['military'],
      5,
    ),
    new RoomTheme(
      'barracks',
      [],
      8,
      8,
      15,
      15,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'beds',
          [
            'There are many beds here.',
            'There are many bunk beds here.',
            'There are many cots here.',
          ],
          [],
          false,
        ),
        new RoomFeatureGenerator(
          'chests',
          ['There are chests at the end of each bed.', 'Each bed has a chest at the foot.'],
          [],
          true,
        ),
      ],
      ['rectangular'],
      ['military'],
      5,
    ),
    new RoomTheme(
      'burial chamber',
      [],
      5,
      5,
      10,
      10,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'coffins',
          [
            'There is a large stone sarcophagus here.',
            'There is an ornate sarcophagus here.',
            'There are several sarcophagi here.',
            'There is a large, ornate coffin here.',
            'There are many coffins here.',
            'Coffins line the walls.',
            'Along the walls are several long alcoves. Each one has a stone coffin.',
          ],
          [],
          true,
        ),
      ],
      ['rectangular'],
      ['tomb'],
      5,
    ),
    new RoomTheme(
      'chamber',
      [],
      2,
      2,
      6,
      6,
      ['marble', 'stone tile'],
      genericFeatures,
      [],
      ['rectangular', 'square'],
      ['dungeon'],
      40,
    ),
    new RoomTheme(
      'fountain chamber',
      [],
      2,
      2,
      5,
      5,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'fountain',
          [
            'There is a large fountain here.',
            'There is an ornate fountain here.',
            'There is a disused fountain here with brackish water.',
            'There is an elegant fountain here.',
            'Two fountains lie on either side of the room.',
            'Small fountains sit in each corner of the room.',
            'An old and disused fountain sits in the corner.',
          ],
          [],
          true,
        ),
      ],
      ['rectangular', 'square'],
      ['dungeon', 'nobility'],
      5,
    ),
    new RoomTheme(
      'kitchen',
      [],
      2,
      2,
      5,
      5,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'oven',
          [
            'There is a large wood-fired oven here.',
            'There are several large ovens here.',
            'Ovens line one of the walls.',
            'A long-dormant oven sits against the back wall.',
          ],
          [],
          false,
        ),
        new RoomFeatureGenerator('pantry cabinet', ['There is a pantry cabinet here.'], [], true),
      ],
      ['rectangular'],
      ['food', 'military'],
      5,
    ),
    new RoomTheme(
      'laboratory',
      [],
      4,
      4,
      6,
      6,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'lab table',
          [
            'There is a large table here with a wide array of alchemical devices on it.',
            'There are several tables here with various devices on them.',
            'Tables with alchemical devices, books, and other items are arranged around the room.',
          ],
          [],
          false,
        ),
        new RoomFeatureGenerator(
          'specimen cabinet',
          [
            'There is a large cabinet here.',
            'There is a simple cabinet here, and the door is ajar.',
            'There is a cabinet here.',
          ],
          [],
          true,
        ),
      ],
      ['rectangular'],
      ['alchemy', 'mage'],
      5,
    ),
    new RoomTheme(
      'library',
      [],
      5,
      5,
      15,
      15,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'bookcases',
          [
            'There are many bookcases here.',
            'There are a number of well-preserved bookcases here.',
            'The walls are lined with bookcases.',
          ],
          [],
          true,
        ),
        new RoomFeatureGenerator(
          'table',
          [
            'There are several tables here.',
            'There is a table here with a large book open lying on it.',
          ],
          [],
          false,
        ),
      ],
      ['rectangular', 'square'],
      ['mage', 'nobility'],
      5,
    ),
    new RoomTheme(
      'storeroom',
      [],
      2,
      2,
      6,
      6,
      ['stone tile'],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          'stacked boxes',
          [
            'Many boxes are stacked here.',
            'Boxes are stacked in corners here.',
            'Crates and large boxes line the walls.',
            'A few broken crates and boxes are strewn about.',
          ],
          [],
          true,
        ),
      ],
      ['rectangular', 'square'],
      ['dungeon'],
      20,
    ),
  ];
}
