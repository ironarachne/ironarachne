'use strict';

import DungeonTheme from '../dungeontheme';
import * as RoomThemes from '../rooms/themes/themes';
import * as Encounters from '../../encounters/templates/templates';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import * as FantasySpecies from '../../species/fantasy';
import * as CommonSpecies from '../../species/common';
import GenericNameGenerator from '../../names/generators/generic';
import RoomRequirement from '../rooms/roomrequirement';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = FantasySpecies.all();

  let fortressEncounters = Encounters.withTag('martial', allEncounters);

  let fortressSentientOptions = CommonSpecies.byTag('martial', allSentientOptions);

  for (let i = 0; i < fortressEncounters.length; i++) {
    if (fortressEncounters[i].tags.includes('soldiers')) {
      fortressEncounters[i].commonality += 20;
    }
  }

  let fortressWeakEncounters = Encounters.belowThreatLevel(3, fortressEncounters);
  let fortressStrongEncounters = Encounters.inThreatLevelRange(3, 4, fortressEncounters);
  let fortressBossEncounters = Encounters.withThreatLevel(5, fortressEncounters);

  let fortressNameGen = new GenericNameGenerator();
  let p1 = ['FORTRESS', 'STRONGHOLD', 'DOMAIN', 'DOMINION', 'LAIR'];
  let p2 = ['DARK', 'DREAD', 'DIRE', 'IRON', 'BLOODY', 'CURSED'];
  let p3 = ['LEGION', 'ARMY'];
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      for (let k = 0; k < p3.length; k++) {
        fortressNameGen.patterns.push(`THE ${p1[i]} OF THE ${p2[j]} ${p3[k]}`);
      }
    }
  }

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

  const allRoomThemes = RoomThemes.all();
  let barracks = RoomThemes.byName('barracks', allRoomThemes);
  let altar = RoomThemes.byName('altar room', allRoomThemes);

  let cultRoomThemes = RoomThemes.byTag('cult', allRoomThemes);
  let dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);
  let militaryRoomThemes = RoomThemes.byTag('military', allRoomThemes);
  let fortressRoomThemes = militaryRoomThemes.concat(dungeonRoomThemes);
  cultRoomThemes = cultRoomThemes.concat(dungeonRoomThemes);

  return [
    new DungeonTheme(
      'fortress',
      'hill',
      fortressNameGen,
      fortressWeakEncounters,
      fortressStrongEncounters,
      fortressBossEncounters,
      fortressSentientOptions,
      ['stone tile'],
      fortressRoomThemes,
      [new RoomRequirement(barracks, 1, 2)],
    ),
    new DungeonTheme(
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
    ),
  ];
}
