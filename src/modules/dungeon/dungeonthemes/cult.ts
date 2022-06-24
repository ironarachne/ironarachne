'use strict';

import DungeonTheme from '../dungeontheme';
import * as RoomThemes from '../rooms/themes/themes';
import * as Encounters from '../../encounters/templates/templates';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import * as FantasySpecies from '../../species/fantasy';
import * as CommonSpecies from '../../species/common';
import GenericNameGenerator from '../../names/generators/generic';
import RoomRequirement from '../rooms/roomrequirement';
import random from 'random';

export function getTheme(): DungeonTheme {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = FantasySpecies.all();
  allSentientOptions = CommonSpecies.withCreatureType('humanoid', allSentientOptions);
  let numberOfSentientOptions = random.int(1, 3);

  let cultEncounters = Encounters.withTag('cult', allEncounters);
  let cultWeakEncounters = Encounters.belowThreatLevel(3, cultEncounters);
  let cultStrongEncounters = Encounters.inThreatLevelRange(3, 4, cultEncounters);
  let cultBossEncounters = Encounters.withThreatLevel(5, cultEncounters);

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

  let cultSentientOptions = CommonSpecies.byTag('corruptible', allSentientOptions);
  cultSentientOptions = CommonSpecies.randomUniqueSet(cultSentientOptions, numberOfSentientOptions);

  const allRoomThemes = RoomThemes.all();
  let barracks = RoomThemes.byName('barracks', allRoomThemes);
  let altar = RoomThemes.byName('altar room', allRoomThemes);

  let cultRoomThemes = RoomThemes.byTag('cult', allRoomThemes);
  let dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);
  cultRoomThemes = cultRoomThemes.concat(dungeonRoomThemes);

  return new DungeonTheme(
    'cult',
    'forest',
    cultNameGen,
    cultWeakEncounters,
    cultStrongEncounters,
    cultBossEncounters,
    cultSentientOptions,
    ['stone tile'],
    cultRoomThemes,
    [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)],
  );
}
