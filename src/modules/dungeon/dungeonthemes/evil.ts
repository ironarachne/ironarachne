'use strict';

import DungeonTheme from '../dungeontheme';
import RoomFeature from '../roomfeature';
import RoomTheme from '../roomtheme';
import * as RND from '../../random';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all();

  return [
    new DungeonTheme(
      'fortress',
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('martial', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('martial', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('martial', allEncounters)),
      [
        new RoomTheme('barracks', [
          new RoomFeature(
            'beds',
            RND.item([
              'There are many beds here.',
              'There are many bunk beds here.',
              'There are many cots here.',
            ]),
            false,
          ),
          new RoomFeature('chests', 'There are chests at the end of each bed.', true),
        ]),
      ],
    ),
    new DungeonTheme(
      'cult',
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('cult', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('cult', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('cult', allEncounters)),
      [
        new RoomTheme('altar room', [
          new RoomFeature(
            'altar',
            RND.item([
              'There is an evil-looking altar here.',
              'There is a blood-covered altar here.',
              'On top of a stone dais is a long altar.',
            ]),
            false,
          ),
        ]),
        new RoomTheme('barracks', [
          new RoomFeature(
            'beds',
            RND.item([
              'There are many beds here.',
              'There are many bunk beds here.',
              'There are many cots here.',
            ]),
            false,
          ),
          new RoomFeature('chests', 'There are chests at the end of each bed.', true),
        ]),
      ],
    ),
  ];
}
