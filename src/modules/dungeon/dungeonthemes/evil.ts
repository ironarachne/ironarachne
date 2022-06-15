'use strict';

import DungeonTheme from '../dungeontheme';
import * as RoomThemes from '../rooms/themes/themes';
import * as Encounters from '../../encounters/templates/templates';
import * as FantasyEncounters from '../../encounters/templates/fantasy/all';
import GenericNameGenerator from '../../names/generators/generic';
import RoomRequirement from '../rooms/roomrequirement';

export function all(): DungeonTheme[] {
  let allEncounters = FantasyEncounters.all(false);

  let fortressEncounters = Encounters.withTag('martial', allEncounters);

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
      fortressWeakEncounters,
      fortressStrongEncounters,
      fortressBossEncounters,
      fortress,
      [new RoomRequirement(barracks, 1, 2)],
    ),
    new DungeonTheme(
      'cult',
      cultNameGen,
      cultWeakEncounters,
      cultStrongEncounters,
      cultBossEncounters,
      cult,
      [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)],
    ),
  ];
}
