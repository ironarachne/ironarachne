"use strict";

import * as MUN from "@ironarachne/made-up-names";
import random from "random";
import * as GenericEncounters from "../../encounters/templates/fantasy/genericdungeon.js";
import * as UndeadEncounters from "../../encounters/templates/fantasy/undead.js";
import * as Encounters from "../../encounters/templates/templates.js";
import * as CommonSpecies from "../../species/common.js";
import * as FantasySpecies from "../../species/fantasy.js";
import DungeonTheme from "../dungeontheme.js";
import * as RoomThemes from "../rooms/themes/themes.js";

export function getTheme(): DungeonTheme {
  let allSentientOptions = FantasySpecies.all();
  allSentientOptions = CommonSpecies.withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 2);

  let tombSentientOptions = CommonSpecies.byTag("martial", allSentientOptions);
  tombSentientOptions = CommonSpecies.randomUniqueSet(tombSentientOptions, numberOfSentientOptions);

  let tombEncounters = GenericEncounters.all();
  tombEncounters = tombEncounters.concat(UndeadEncounters.all());

  let tombWeakEncounters = Encounters.belowThreatLevel(2, tombEncounters);
  let tombStrongEncounters = Encounters.inThreatLevelRange(3, 4, tombEncounters);
  let tombBossEncounters = Encounters.withThreatLevel(5, tombEncounters);

  let tombNameGen = new MUN.GenericNameGenerator();
  let t1 = ["TOMB", "CRYPT", "CATACOMBS", "MAUSOLEUM", "BARROWS"];
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

  const allRoomThemes = RoomThemes.all();
  const dungeonRoomThemes = RoomThemes.byTag("dungeon", allRoomThemes);

  let tombRoomThemes = RoomThemes.byTag("tomb", allRoomThemes);
  tombRoomThemes = tombRoomThemes.concat(dungeonRoomThemes);

  return new DungeonTheme(
    "tomb",
    "hill",
    tombNameGen,
    tombWeakEncounters,
    tombStrongEncounters,
    tombBossEncounters,
    tombSentientOptions,
    ["stone tile"],
    tombRoomThemes,
    [],
  );
}
