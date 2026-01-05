import * as MUN from '@ironarachne/made-up-names';
import type * as RNG from '@ironarachne/rng';
import * as FantasyEncounters from '$lib/encounters/templates/fantasy/all.js';
import * as GenericEncounters from '$lib/encounters/templates/fantasy/generic_dungeon.js';
import * as Encounters from '$lib/encounters/templates/templates.js';
import * as CommonSpecies from '$lib/species/common.js';
import type { DungeonTheme } from './index.js';
import * as RoomThemes from '../rooms/themes/themes.js';

export function getTheme(rng: RNG.RNG): DungeonTheme {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = CommonSpecies.sentient();
  allSentientOptions = CommonSpecies.withCreatureType('humanoid', allSentientOptions);
  let numberOfSentientOptions = rng.int(1, 2);

  let magicSentientOptions = allSentientOptions;
  magicSentientOptions = CommonSpecies.randomUniqueSet(
    magicSentientOptions,
    numberOfSentientOptions,
    rng,
  );

  let magicEncounters = Encounters.withTag('magic', allEncounters);
  magicEncounters = magicEncounters.concat(GenericEncounters.all());
  let magicWeakEncounters = Encounters.belowThreatLevel(3, magicEncounters);
  let magicStrongEncounters = Encounters.inThreatLevelRange(3, 4, magicEncounters);
  let magicBossEncounters = Encounters.withThreatLevel(5, magicEncounters);

  let namePatterns = [];
  let m1 = ['LABORATORY', 'LAIR', 'DOMAIN', 'DOMINION'];
  let m2 = ['MAD', 'DREAD', 'DARK', 'CRAZED', 'RECLUSIVE', 'DOOMED', 'CURSED'];
  let m3 = ['ARCHMAGE', 'SORCERER', 'WIZARD', 'WITCH', 'WARLOCK'];

  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      for (let k = 0; k < m3.length; k++) {
        namePatterns.push(`THE ${m1[i]} OF THE ${m2[j]} ${m3[k]}`);
      }
    }
  }

  const allRoomThemes = RoomThemes.all(rng);
  const dungeonRoomThemes = RoomThemes.byTag('dungeon', allRoomThemes);

  let mageRoomThemes = RoomThemes.byTag('mage', allRoomThemes);
  mageRoomThemes = mageRoomThemes.concat(dungeonRoomThemes);

  return {
    name: 'mage lair',
    mainEnvironment: 'forest',
    nameGeneratorPatterns: namePatterns,
    weakEncounterTemplates: magicWeakEncounters,
    strongEncounterTemplates: magicStrongEncounters,
    bossEncounterTemplates: magicBossEncounters,
    sentientOptions: magicSentientOptions,
    flooringOptions: ['stone tile', 'marble'],
    roomThemes: mageRoomThemes,
    requiredRooms: [],
  };
}
