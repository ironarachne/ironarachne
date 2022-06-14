'use strict';

import DungeonTheme from '../dungeontheme';
import RoomFeature from '../rooms/features/feature';
import RoomTheme from '../rooms/themes/theme';
import * as RoomThemes from '../rooms/themes/themes';
import * as RND from '../../random';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import GenericNameGenerator from '../../names/generators/generic';
import EncounterTemplate from '../../encounters/template';
import EncounterGroupTemplate from '../../encounters/grouptemplate';
import Archetype from '../../archetypes/archetype';
import RoomRequirement from '../rooms/roomrequirement';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all(false);

  let fortressEncounters = FantasyEncounters.withTag('martial', allEncounters);

  let fortressBossEncounters = [
    new EncounterTemplate(
      'general',
      5,
      [
        new EncounterGroupTemplate(
          'general',
          5,
          true,
          [new Archetype('general', [], ['general', 'martial'])],
          [],
          ['undead'],
          1,
          1,
        ),
      ],
      ['martial'],
    ),
  ];

  let fortressNameGen = new GenericNameGenerator();
  let p1 = ['DARK', 'DREAD', 'DIRE', 'IRON'];
  let p2 = ['FORTRESS', 'STRONGHOLD', 'DOMAIN'];
  let p3 = ['LEGION', 'ARMY'];
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      for (let k = 0; k < p3.length; k++) {
        fortressNameGen.patterns.push(`THE ${p2[j]} OF THE ${p1[i]} ${p3[k]}`);
      }
    }
  }

  let cultEncounters = FantasyEncounters.withTag('cult', allEncounters);

  let cultBossEncounters = [
    new EncounterTemplate(
      'cult high priest',
      5,
      [
        new EncounterGroupTemplate(
          'cult high priest',
          5,
          true,
          [new Archetype('cult high priest', [], ['priest', 'cult'])],
          [],
          ['undead'],
          1,
          1,
        ),
      ],
      ['cult'],
    ),
  ];

  let cultNameGen = new GenericNameGenerator();
  let c1 = ['DEN', 'DOMAIN', 'LAIR'];
  let c2 = ['BALEFUL', 'VILE', 'DARK', 'DEMONIC'];
  let c3 = ['BROTHERHOOD', 'ORDER'];
  for (let i = 0; i < c1.length; i++) {
    for (let j = 0; j < c2.length; j++) {
      for (let k = 0; k < c3.length; k++) {
        cultNameGen.patterns.push(`THE ${c1[i]} OF THE ${c2[j]} ${c3[k]}`);
      }
    }
  }

  const allRoomThemes = RoomThemes.all();
  let barracks = RoomThemes.byName('barracks', allRoomThemes);
  let altar = RoomThemes.byName('altar room', allRoomThemes);

  let cult = RoomThemes.byTag('cult', allRoomThemes);
  let dungeon = RoomThemes.byTag('dungeon', allRoomThemes);
  let military = RoomThemes.byTag('military', allRoomThemes);
  let fortress = military.concat(dungeon);
  cult = cult.concat(dungeon);

  return [
    new DungeonTheme(
      'fortress',
      fortressNameGen,
      fortressEncounters,
      fortressEncounters,
      fortressBossEncounters,
      fortress,
      [new RoomRequirement(barracks, 1, 2)],
    ),
    new DungeonTheme(
      'cult',
      cultNameGen,
      cultEncounters,
      cultEncounters,
      cultBossEncounters,
      cult,
      [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)],
    ),
  ];
}
