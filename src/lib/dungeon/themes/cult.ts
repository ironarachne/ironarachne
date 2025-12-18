import type * as RNG from "@ironarachne/rng";
import * as FantasyEncounters from "$lib/encounters/templates/fantasy/all.js";
import * as Encounters from "$lib/encounters/templates/templates.js";
import * as CommonSpecies from "$lib/species/common.js";
import type { DungeonTheme } from "./index.js";
import RoomRequirement from "../rooms/roomrequirement.js";
import * as RoomThemes from "../rooms/themes/themes.js";

export function getTheme(rng: RNG.RNG): DungeonTheme {
  let allEncounters = FantasyEncounters.all(false);
  let allSentientOptions = CommonSpecies.sentient();
  allSentientOptions = CommonSpecies.withCreatureType(
    "humanoid",
    allSentientOptions,
  );
  let numberOfSentientOptions = rng.int(1, 3);

  let cultEncounters = Encounters.withTag("cult", allEncounters);
  let cultWeakEncounters = Encounters.belowThreatLevel(3, cultEncounters);
  let cultStrongEncounters = Encounters.inThreatLevelRange(
    3,
    4,
    cultEncounters,
  );
  let cultBossEncounters = Encounters.withThreatLevel(5, cultEncounters);

  let namePatterns = [];
  let c1 = ["DEN", "DOMAIN", "LAIR"];
  let c2 = ["BALEFUL", "VILE", "DARK", "DEMONIC"];
  let c3 = ["BROTHERHOOD", "ORDER"];
  for (let i = 0; i < c1.length; i++) {
    for (let j = 0; j < c2.length; j++) {
      for (let k = 0; k < c3.length; k++) {
        namePatterns.push(`THE ${c1[i]} OF THE ${c2[j]} ${c3[k]}`);
      }
    }
  }
  let cultSentientOptions = CommonSpecies.byTag(
    "corruptible",
    allSentientOptions,
  );
  cultSentientOptions = CommonSpecies.randomUniqueSet(
    cultSentientOptions,
    numberOfSentientOptions,
    rng
  );

  const allRoomThemes = RoomThemes.all(rng);
  let barracks = RoomThemes.byName("barracks", allRoomThemes);
  let altar = RoomThemes.byName("altar room", allRoomThemes);

  let cultRoomThemes = RoomThemes.byTag("cult", allRoomThemes);
  let dungeonRoomThemes = RoomThemes.byTag("dungeon", allRoomThemes);
  cultRoomThemes = cultRoomThemes.concat(dungeonRoomThemes);

  return {
    name: "cult",
    mainEnvironment: "forest",
    nameGeneratorPatterns: namePatterns,
    weakEncounterTemplates: cultWeakEncounters,
    strongEncounterTemplates: cultStrongEncounters,
    bossEncounterTemplates: cultBossEncounters,
    sentientOptions: cultSentientOptions,
    flooringOptions: ["stone tile"],
    roomThemes: cultRoomThemes,
    requiredRooms: [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)],
  };
}
