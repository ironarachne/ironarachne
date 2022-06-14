'use strict';

import RoomFeatureGenerator from '../features/featuregenerator';
import RoomTheme from './theme';

export function all(): RoomTheme[] {
  let genericFeatures = [
    new RoomFeatureGenerator('debris', ['There is a pile of random debris here.'], false),
    new RoomFeatureGenerator('rags', ['There is a pile of rags here.'], false),
    new RoomFeatureGenerator('cobwebs', ['There are a lot of cobwebs here.'], false),
  ];

  return [
    new RoomTheme(
      'altar room',
      'dungeon',
      3,
      3,
      10,
      10,
      [
        new RoomFeatureGenerator(
          'altar',
          [
            'There is an evil-looking altar here.',
            'There is a blood-covered altar here.',
            'On top of a stone dais is a long altar.',
          ],
          false,
        ),
      ],
      ['rectangular'],
      ['cult'],
    ),
    new RoomTheme(
      'barracks',
      'dungeon',
      8,
      8,
      15,
      15,
      [
        new RoomFeatureGenerator(
          'beds',
          [
            'There are many beds here.',
            'There are many bunk beds here.',
            'There are many cots here.',
          ],
          false,
        ),
        new RoomFeatureGenerator(
          'chests',
          ['There are chests at the end of each bed.', 'Each bed has a chest at the foot.'],
          true,
        ),
      ],
      ['rectangular'],
      ['military'],
    ),
    new RoomTheme(
      'burial chamber',
      'dungeon',
      5,
      5,
      10,
      10,
      [
        new RoomFeatureGenerator(
          'coffins',
          [
            'There is a large stone sarcophagus here.',
            'There is an ornate sarcophagus here.',
            'There are several sarcophagi here.',
            'There is a large, ornate coffin here.',
            'There are many coffins here.',
          ],
          true,
        ),
      ],
      ['rectangular'],
      ['tomb'],
    ),
    new RoomTheme(
      'chamber',
      'dungeon',
      2,
      2,
      6,
      6,
      genericFeatures,
      ['rectangular', 'square'],
      ['dungeon'],
    ),
    new RoomTheme(
      'fountain chamber',
      'dungeon',
      2,
      2,
      5,
      5,
      [
        new RoomFeatureGenerator(
          'fountain',
          [
            'There is a large fountain here.',
            'There is an ornate fountain here.',
            'There is a disused fountain here with brackish water.',
            'There is an elegant fountain here.',
          ],
          true,
        ),
      ],
      ['rectangular', 'square'],
      ['dungeon', 'nobility'],
    ),
    new RoomTheme(
      'kitchen',
      'dungeon',
      2,
      2,
      5,
      5,
      [
        new RoomFeatureGenerator(
          'oven',
          ['There is a large wood-fired oven here.', 'There are several large ovens here.'],
          false,
        ),
        new RoomFeatureGenerator('pantry cabinet', ['There is a pantry cabinet here.'], true),
      ],
      ['rectangular'],
      ['military'],
    ),
    new RoomTheme(
      'laboratory',
      'dungeon',
      4,
      4,
      15,
      15,
      [
        new RoomFeatureGenerator(
          'lab table',
          [
            'There is a large table here with a wide array of alchemical devices on it.',
            'There are several tables here with various devices on them.',
          ],
          false,
        ),
        new RoomFeatureGenerator(
          'specimen cabinet',
          [
            'There is a large cabinet here.',
            'There is a simple cabinet here, and the door is ajar.',
            'There is a cabinet here.',
          ],
          true,
        ),
      ],
      ['rectangular'],
      ['alchemy', 'mage'],
    ),
    new RoomTheme(
      'library',
      'dungeon',
      5,
      5,
      15,
      15,
      [
        new RoomFeatureGenerator(
          'bookcases',
          [
            'There are many bookcases here.',
            'There are a number of well-preserved bookcases here.',
            'The walls are lined with bookcases.',
          ],
          true,
        ),
        new RoomFeatureGenerator(
          'table',
          [
            'There are several tables here.',
            'There is a table here with a large book open lying on it.',
          ],
          false,
        ),
      ],
      ['rectangular', 'square'],
      ['mage', 'nobility'],
    ),
  ];
}
