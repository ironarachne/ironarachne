'use strict';

import DungeonTheme from '../dungeontheme';
import RoomFeature from '../rooms/features/feature';
import RoomTheme from '../rooms/themes/theme';
import * as RoomThemes from '../rooms/themes/themes';
import * as RND from '../../random';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import * as GenericEncounters from '../../encounters/templates/fantasy/genericdungeon';
import * as UndeadEncounters from '../../encounters/templates/fantasy/undead';
import EncounterTemplate from '../../encounters/template';
import Archetype from '../../archetypes/archetype';
import EncounterGroupTemplate from '../../encounters/grouptemplate';
import GenericNameGenerator from '../../names/generators/generic';
import RoomRequirement from '../rooms/roomrequirement';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all(false);

  let tombEncounters = GenericEncounters.all();
  tombEncounters = tombEncounters.concat(UndeadEncounters.all());
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

  let tombBossEncounters = [
    new EncounterTemplate(
      'lich',
      5,
      [
        new EncounterGroupTemplate(
          'lich',
          5,
          true,
          [new Archetype('lich', [], ['lich', 'undead'])],
          [],
          ['undead'],
          1,
          1,
        ),
      ],
      ['undead'],
    ),
  ];

  let tombNameGen = new GenericNameGenerator();
  let t1 = ['TOMB', 'CRYPT', 'MAUSOLEUM'];
  let t2 = [`THE DAMNED`, `THE FORGOTTEN`];
  for (let i = 0; i < t1.length; i++) {
    for (let j = 0; j < t2.length; j++) {
      tombNameGen.patterns.push(`THE ${t1[i]} OF ${t2[j]}`);
    }
  }

  let cultEncounters = FantasyEncounters.withTag('cult', allEncounters);
  cultEncounters = cultEncounters.concat(GenericEncounters.all());

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

  let magicEncounters = FantasyEncounters.withTag('magic', allEncounters);
  magicEncounters = magicEncounters.concat(GenericEncounters.all());

  let magicBossEncounters = [
    new EncounterTemplate(
      'archmage',
      5,
      [
        new EncounterGroupTemplate(
          'archmage',
          5,
          true,
          [new Archetype('archmage', [], ['mage'])],
          [],
          ['undead'],
          1,
          1,
        ),
      ],
      ['mage'],
    ),
  ];

  let magicNameGen = new GenericNameGenerator();
  let m1 = [`LABORATORY`, `LAIR`, `DOMAIN`];
  let m2 = ['MAD', 'DREAD', 'DARK'];
  let m3 = ['ARCHMAGE', 'SORCERER', 'WIZARD', 'WARLOCK'];

  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      for (let k = 0; k < m3.length; k++) {
        magicNameGen.patterns.push(`THE ${m1[i]} OF THE ${m2[j]} ${m3[k]}`);
      }
    }
  }

  const allRoomThemes = RoomThemes.all();
  const dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);
  let barracks = RoomThemes.byName('barracks', allRoomThemes);
  let altar = RoomThemes.byName('altar room', allRoomThemes);
  let tombRoomThemes = RoomThemes.byTag('tomb', allRoomThemes);
  tombRoomThemes = tombRoomThemes.concat(dungeonRoomThemes);

  let cultRoomThemes = RoomThemes.byTag('cult', allRoomThemes);
  cultRoomThemes = cultRoomThemes.concat(dungeonRoomThemes);

  let mageRoomThemes = RoomThemes.byTag('mage', allRoomThemes);
  mageRoomThemes = mageRoomThemes.concat(dungeonRoomThemes);

  return [
    new DungeonTheme(
      'tomb',
      tombNameGen,
      tombEncounters,
      tombEncounters,
      tombBossEncounters,
      tombRoomThemes,
      [],
    ),
    new DungeonTheme(
      'cult',
      cultNameGen,
      cultEncounters,
      cultEncounters,
      cultBossEncounters,
      cultRoomThemes,
      [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)],
    ),
    new DungeonTheme(
      'mage lair',
      magicNameGen,
      magicEncounters,
      magicEncounters,
      magicBossEncounters,
      mageRoomThemes,
      [],
    ),
  ];
}
