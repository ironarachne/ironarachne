"use strict";

import * as RND from "@ironarachne/rng";
import ADNDCharacter from "../adndcharacter.js";
import ADNDClass from "../adndclass.js";
import * as ThiefSkills from "../adndthiefskills.js";

export default new ADNDClass(
  "thief",
  "rogue",
  "1d6",
  -1,
  9,
  -1,
  -1,
  -1,
  -1,
  ["dexterity"],
  [
    "Pick pockets",
    "Open locks",
    "Find/remove traps",
    "Move silently",
    "Hide in shadows",
    "Detect noise",
    "Climb walls",
    "Read languages",
    "Backstab",
    "Thieves' cant",
  ],
  [
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good",
  ],
  false,
  [],
  [],
  [
    "club",
    "dagger",
    "hand crossbow",
    "lasso",
    "short bow",
    "broad sword",
    "long sword",
    "short sword",
    "staff",
    "dart",
    "knife",
    "sling",
  ],
  ["leather", "studded leather", "padded", "elven chain armor"],
  2,
  3,
  -3,
  function(this: ADNDClass, character: ADNDCharacter): ADNDCharacter {
    let skills = [
      { name: "Pick Pockets", value: 15, points: 0 },
      { name: "Open Locks", value: 10, points: 0 },
      { name: "Find/Remove Traps", value: 5, points: 0 },
      { name: "Move Silently", value: 10, points: 0 },
      { name: "Hide in Shadows", value: 5, points: 0 },
      { name: "Detect Noise", value: 15, points: 0 },
      { name: "Climb Walls", value: 60, points: 0 },
      { name: "Read Languages", value: 0, points: 0 },
    ];
    skills = RND.shuffle(skills);

    skills = ThiefSkills.modifyForDexterity(skills, character.dexterity);

    let raceName = character.race.name;
    if (character.race.name.includes("halfling")) {
      raceName = "halfling";
    }

    skills = ThiefSkills.modifyForRace(skills, raceName);
    skills = ThiefSkills.distributePoints(skills, 60);

    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value}%`);
    }

    return character;
  },
);
