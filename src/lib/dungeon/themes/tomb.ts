import * as MUN from '@ironarachne/made-up-names';
import type * as RNG from '@ironarachne/rng';
import * as GenericEncounters from '$lib/encounters/templates/fantasy/generic_dungeon.js';
import * as UndeadEncounters from '$lib/encounters/templates/fantasy/undead.js';
import * as Encounters from '$lib/encounters/templates/templates.js';
import * as CommonSpecies from '$lib/species/common.js';
import type { DungeonTheme } from './index.js';
import * as RoomThemes from '../rooms/themes/themes.js';

export function getTheme(rng: RNG.RNG): DungeonTheme {
  let allSentientOptions = CommonSpecies.sentient();
  allSentientOptions = CommonSpecies.withCreatureType('humanoid', allSentientOptions);
  let numberOfSentientOptions = rng.int(1, 2);

  let tombSentientOptions = CommonSpecies.byTag('martial', allSentientOptions);
  tombSentientOptions = CommonSpecies.randomUniqueSet(
    tombSentientOptions,
    numberOfSentientOptions,
    rng,
  );

  let tombEncounters = GenericEncounters.all();
  tombEncounters = tombEncounters.concat(UndeadEncounters.all());

  let tombWeakEncounters = Encounters.belowThreatLevel(2, tombEncounters);
  let tombStrongEncounters = Encounters.inThreatLevelRange(3, 4, tombEncounters);
  let tombBossEncounters = Encounters.withThreatLevel(5, tombEncounters);

  let namePatterns = [];
  let t1 = ['TOMB', 'CRYPT', 'CATACOMBS', 'MAUSOLEUM', 'BARROWS'];
  let t2 = [
    'THE DAMNED',
    'THE FORGOTTEN',
    'THE LOST',
    'WAKING NIGHTMARES',
    'FORGOTTEN SOULS',
    'LOST SOULS',
  ];
  for (let i = 0; i < t1.length; i++) {
    for (let j = 0; j < t2.length; j++) {
      namePatterns.push(`THE ${t1[i]} OF ${t2[j]}`);
    }
  }

  const allRoomThemes = RoomThemes.all(rng);
  const dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);

  let tombRoomThemes = RoomThemes.byTag('tomb', allRoomThemes);
  tombRoomThemes = tombRoomThemes.concat(dungeonRoomThemes);

  return {
    name: 'tomb',
    mainEnvironment: 'hill',
    nameGeneratorPatterns: namePatterns,
    weakEncounterTemplates: tombWeakEncounters,
    strongEncounterTemplates: tombStrongEncounters,
    bossEncounterTemplates: tombBossEncounters,
    sentientOptions: tombSentientOptions,
    flooringOptions: ['stone tile'],
    roomThemes: tombRoomThemes,
    requiredRooms: [],
  };
}
