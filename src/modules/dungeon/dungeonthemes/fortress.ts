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

  let fortressEncounters = Encounters.withTag('martial', allEncounters);

  let fortressSentientOptions = CommonSpecies.byTag('martial', allSentientOptions);
  fortressSentientOptions = CommonSpecies.randomUniqueSet(
    fortressSentientOptions,
    numberOfSentientOptions,
  );

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

  const allRoomThemes = RoomThemes.all();
  let barracks = RoomThemes.byName('barracks', allRoomThemes);

  let dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);
  let militaryRoomThemes = RoomThemes.byTag('military', allRoomThemes);
  let fortressRoomThemes = militaryRoomThemes.concat(dungeonRoomThemes);

  return new DungeonTheme(
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
  );
}
