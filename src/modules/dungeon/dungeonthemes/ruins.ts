'use strict';

import DungeonTheme from '../dungeontheme';
import * as RoomThemes from '../rooms/themes/themes';
import * as Encounters from '../../encounters/templates/templates';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import * as GenericEncounters from '../../encounters/templates/fantasy/genericdungeon';
import * as UndeadEncounters from '../../encounters/templates/fantasy/undead';
import * as FantasySpecies from '../../species/fantasy';
import * as CommonSpecies from '../../species/common';
import GenericNameGenerator from '../../names/generators/generic';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = FantasySpecies.all();

  let tombSentientOptions = CommonSpecies.byTag('martial', allSentientOptions);

  let tombEncounters = GenericEncounters.all();
  tombEncounters = tombEncounters.concat(UndeadEncounters.all());

  let tombWeakEncounters = Encounters.belowThreatLevel(2, tombEncounters);
  let tombStrongEncounters = Encounters.inThreatLevelRange(3, 4, tombEncounters);
  let tombBossEncounters = Encounters.withThreatLevel(5, tombEncounters);

  let tombNameGen = new GenericNameGenerator();
  let t1 = ['TOMB', 'CRYPT', 'CATACOMBS', 'MAUSOLEUM', 'BARROWS'];
  let t2 = [
    `THE DAMNED`,
    `THE FORGOTTEN`,
    `THE LOST`,
    `WAKING NIGHTMARES`,
    `FORGOTTEN SOULS`,
    `LOST SOULS`,
  ];
  for (let i = 0; i < t1.length; i++) {
    for (let j = 0; j < t2.length; j++) {
      tombNameGen.patterns.push(`THE ${t1[i]} OF ${t2[j]}`);
    }
  }

  let magicSentientOptions = CommonSpecies.byTag('magic', allSentientOptions);

  let magicEncounters = Encounters.withTag('magic', allEncounters);
  magicEncounters = magicEncounters.concat(GenericEncounters.all());
  let magicWeakEncounters = Encounters.belowThreatLevel(3, magicEncounters);
  let magicStrongEncounters = Encounters.inThreatLevelRange(3, 4, magicEncounters);
  let magicBossEncounters = Encounters.withThreatLevel(5, magicEncounters);

  let magicNameGen = new GenericNameGenerator();
  let m1 = [`LABORATORY`, `LAIR`, `DOMAIN`, `DOMINION`];
  let m2 = ['MAD', 'DREAD', 'DARK', 'CRAZED', 'RECLUSIVE', 'DOOMED', 'CURSED'];
  let m3 = ['ARCHMAGE', 'SORCERER', 'WIZARD', 'WITCH', 'WARLOCK'];

  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      for (let k = 0; k < m3.length; k++) {
        magicNameGen.patterns.push(`THE ${m1[i]} OF THE ${m2[j]} ${m3[k]}`);
      }
    }
  }

  const allRoomThemes = RoomThemes.all();
  const dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);

  let tombRoomThemes = RoomThemes.byTag('tomb', allRoomThemes);
  tombRoomThemes = tombRoomThemes.concat(dungeonRoomThemes);

  let mageRoomThemes = RoomThemes.byTag('mage', allRoomThemes);
  mageRoomThemes = mageRoomThemes.concat(dungeonRoomThemes);

  return [
    new DungeonTheme(
      'tomb',
      'hill',
      tombNameGen,
      tombWeakEncounters,
      tombStrongEncounters,
      tombBossEncounters,
      tombSentientOptions,
      ['stone tile'],
      tombRoomThemes,
      [],
    ),
    new DungeonTheme(
      'mage lair',
      'forest',
      magicNameGen,
      magicWeakEncounters,
      magicStrongEncounters,
      magicBossEncounters,
      magicSentientOptions,
      ['stone tile', 'marble'],
      mageRoomThemes,
      [],
    ),
  ];
}
