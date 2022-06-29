'use strict';

import RoomFeatureGenerator from '../features/featuregenerator';
import RoomTheme from './theme';
import * as Dungeon from './dungeon';

export function all(): RoomTheme[] {
  let result = [];

  result = result.concat(Dungeon.all());

  return result;
}

export function byName(name: string, themes: RoomTheme[]): RoomTheme {
  for (let i = 0; i < themes.length; i++) {
    if (themes[i].name == name) {
      return themes[i];
    }
  }

  console.error(`Failed to find room theme with name ${name}.`);
}

export function byTag(tag: string, themes: RoomTheme[]): RoomTheme[] {
  let result = [];

  for (let i = 0; i < themes.length; i++) {
    if (themes[i].tags.includes(tag)) {
      result.push(themes[i]);
    }
  }

  return result;
}

export function getEntrance(): RoomTheme {
  return new RoomTheme(
    'entrance',
    [],
    2,
    2,
    4,
    4,
    ['stone tile'],
    [],
    [
      new RoomFeatureGenerator(
        'entrance',
        [
          'The entrance to the dungeon is here.',
          'The stairs out of the dungeon are here.',
          'There is a set of stairs here leading out of the dungeon.',
          'The stairs leading out of the dungeon are here.',
        ],
        [],
        false,
      ),
    ],
    [],
    ['rectangular', 'square'],
    ['dungeon', 'entrance'],
    10,
  );
}
