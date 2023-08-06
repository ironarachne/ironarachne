"use strict";

import * as MUN from "@ironarachne/made-up-names";
import random from "random";
import * as FantasyEncounters from "../../encounters/templates/fantasy/all.js";
import * as GenericEncounters from "../../encounters/templates/fantasy/genericdungeon.js";
import * as Encounters from "../../encounters/templates/templates.js";
import * as CommonSpecies from "../../species/common.js";
import * as FantasySpecies from "../../species/fantasy.js";
import DungeonTheme from "../dungeontheme.js";
import * as RoomThemes from "../rooms/themes/themes.js";

export function getTheme(): DungeonTheme {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = FantasySpecies.all();
  allSentientOptions = CommonSpecies.withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 2);

  let magicSentientOptions = allSentientOptions;
  magicSentientOptions = CommonSpecies.randomUniqueSet(
    magicSentientOptions,
    numberOfSentientOptions,
  );

  let magicEncounters = Encounters.withTag("magic", allEncounters);
  magicEncounters = magicEncounters.concat(GenericEncounters.all());
  let magicWeakEncounters = Encounters.belowThreatLevel(3, magicEncounters);
  let magicStrongEncounters = Encounters.inThreatLevelRange(3, 4, magicEncounters);
  let magicBossEncounters = Encounters.withThreatLevel(5, magicEncounters);

  let magicNameGen = new MUN.GenericNameGenerator();
  let m1 = [`LABORATORY`, `LAIR`, `DOMAIN`, `DOMINION`];
  let m2 = ["MAD", "DREAD", "DARK", "CRAZED", "RECLUSIVE", "DOOMED", "CURSED"];
  let m3 = ["ARCHMAGE", "SORCERER", "WIZARD", "WITCH", "WARLOCK"];

  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      for (let k = 0; k < m3.length; k++) {
        magicNameGen.patterns.push(`THE ${m1[i]} OF THE ${m2[j]} ${m3[k]}`);
      }
    }
  }

  const allRoomThemes = RoomThemes.all();
  const dungeonRoomThemes = RoomThemes.byTag("dungeon", allRoomThemes);

  let mageRoomThemes = RoomThemes.byTag("mage", allRoomThemes);
  mageRoomThemes = mageRoomThemes.concat(dungeonRoomThemes);

  return new DungeonTheme(
    "mage lair",
    "forest",
    magicNameGen,
    magicWeakEncounters,
    magicStrongEncounters,
    magicBossEncounters,
    magicSentientOptions,
    ["stone tile", "marble"],
    mageRoomThemes,
    [],
  );
}
