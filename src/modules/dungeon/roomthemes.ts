'use strict';

import RoomFeature from './roomfeature';
import RoomTheme from './roomtheme';
import * as RND from '../random';

export function all(): RoomTheme[] {
  return [
    new RoomTheme('kitchen', 'dungeon', [
      new RoomFeature(
        'oven',
        RND.item(['There is a large wood-fired oven here.', 'There are several large ovens here.']),
        false,
      ),
      new RoomFeature('pantry cabinet', RND.item(['There is a pantry cabinet here.']), true),
    ]),
    new RoomTheme('fountain chamber', 'dungeon', [
      new RoomFeature(
        'fountain',
        RND.item([
          'There is a large fountain here.',
          'There is an ornate fountain here.',
          'There is a disused fountain here with brackish water.',
          'There is an elegant fountain here.',
        ]),
        true,
      ),
    ]),
  ];
}
