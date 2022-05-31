'use strict';

import DungeonTheme from '../dungeontheme';
import RoomFeature from '../roomfeature';
import RoomTheme from '../roomtheme';
import * as RND from '../../random';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import EncounterTemplate from '../../encounters/template';
import Archetype from '../../archetypes/archetype';
import EncounterGroupTemplate from '../../encounters/grouptemplate';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all();
  let tombEncounters = FantasyEncounters.withTag('cult', allEncounters);
  tombEncounters.push(
    new EncounterTemplate(
      'tomb raiders',
      2,
      [
        new EncounterGroupTemplate(
          'tomb raiders',
          2,
          true,
          [new Archetype('tomb raider', [], ['tomb raider'])],
          ['sentient'],
          ['undead'],
          2,
          4,
        ),
      ],
      ['tomb raiders'],
    ),
  );

  return [
    new DungeonTheme('tomb', tombEncounters, tombEncounters, tombEncounters, [
      new RoomTheme('burial chamber', [
        new RoomFeature(
          'coffins',
          RND.item([
            'There is a large stone sarcophagus here.',
            'There is an ornate sarcophagus here.',
            'There are several sarcophagi here.',
            'There is a large, ornate coffin here.',
            'There are many coffins here.',
          ]),
          true,
        ),
      ]),
    ]),
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
    new DungeonTheme(
      'laboratory',
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('magic', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('magic', allEncounters)),
      FantasyEncounters.withoutTag('undead', FantasyEncounters.withTag('magic', allEncounters)),
      [
        new RoomTheme('library', [
          new RoomFeature(
            'bookcases',
            RND.item([
              'There are many bookcases here.',
              'There are a number of well-preserved bookcases here.',
              'The walls are lined with bookcases.',
            ]),
            true,
          ),
          new RoomFeature(
            'table',
            RND.item([
              'There are several tables here.',
              'There is a table here with a large book open lying on it.',
            ]),
            false,
          ),
        ]),
        new RoomTheme('laboratory', [
          new RoomFeature(
            'lab table',
            RND.item([
              'There is a large table here with a wide array of alchemical devices on it.',
              'There are several tables here with various devices on them.',
            ]),
            false,
          ),
          new RoomFeature(
            'specimen cabinet',
            RND.item([
              'There is a large cabinet here.',
              'There is a simple cabinet here, and the door is ajar.',
              'There is a cabinet here.',
            ]),
            true,
          ),
        ]),
      ],
    ),
  ];
}
