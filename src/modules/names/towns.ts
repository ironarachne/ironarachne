'use strict';

import * as RND from '../random';
import * as Common from './common';
import * as Invented from './invented';

export function randomSet(numberOfNames: number) {
  const nameTypes = [
    {
      generate: function () {
        const first = [
          'Two',
          'Three',
          'Four',
          'Five',
          'Six',
          'Seven',
          'Eight',
          'Nine',
          'Ten',
          'Twin',
          'Triple',
          'Black',
          'White',
          'Blue',
          'Grey',
          'Green',
          'Purple',
          'Red',
          'Yellow',
        ];

        const second = [
          'Barrows',
          'Cliffs',
          'Falls',
          'Hills',
          'Hollows',
          'Mountains',
          'Peaks',
          'Ridges',
          'Rivers',
          'Rocks',
          'Streams',
          'Towers',
          'Trees',
          'Valleys',
          'Waters',
        ];

        return RND.item(first) + ' ' + RND.item(second);
      },
    },
    {
      generate: function () {
        const firstNames = Common.maleFirstNames();

        const first = RND.item(firstNames);

        const second = RND.item([
          'Folly',
          'Boon',
          'Rest',
          'Bequest',
          'Garden',
          'Repose',
          'Haven',
          'End',
          'Pass',
          'Forge',
          'Bulwark',
        ]);

        return first + "'s " + second;
      },
    },
    {
      generate: function () {
        const patterns = ['vlpvl', 'tvnv', 'lvpcv'];

        const first = Invented.generate(patterns);

        const second = RND.item([
          'arm',
          'bend',
          'borough',
          'bury',
          'don',
          'end',
          'ford',
          'forge',
          'gale',
          'glade',
          'haven',
          'keep',
          'meet',
          'rock',
          'stead',
          'stone',
          'ton',
          'town',
          'vale',
          'ville',
        ]);

        return first + second;
      },
    },
    {
      generate: function () {
        const first = RND.item([
          'Lake',
          'River',
          'Fire',
          'Mountain',
          'Stream',
          'Hill',
          'White',
          'Winter',
          'Fall',
          'Gold',
          'Silver',
          'Copper',
          'Iron',
          'Field',
          'Sky',
          'Summer',
          'Autumn',
          'Spring',
          'Night',
        ]);

        const second = RND.item([
          'stead',
          'town',
          'bend',
          'bury',
          'ton',
          'vale',
          'borough',
          'haven',
          'keep',
          'meet',
          'forge',
          'gale',
          'stone',
          'rock',
          'glade',
          'ford',
        ]);

        return first + second;
      },
    },
  ];

  const names: string[] = [];

  for (let i = 0; i < numberOfNames; i++) {
    const nameType = RND.item(nameTypes);
    const name = nameType.generate();

    if (!names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}
