"use strict";

import * as RND from "@ironarachne/rng";
import ADNDCharacter from "../adndcharacter.js";
import ADNDClass from "../adndclass.js";
import * as ThiefSkills from "../adndthiefskills.js";

export default new ADNDClass(
  "bard",
  "rogue",
  "1d6",
  -1,
  12,
  -1,
  13,
  -1,
  15,
  ["dexterity", "charisma"],
  ["Climb walls", "Detect noise", "Pick pockets", "Read languages", "Influence reactions"],
  ["lawful neutral", "neutral good", "true neutral", "neutral evil", "chaotic neutral"],
  false,
  [],
  [],
  ["any"],
  ["padded", "leather", "studded leather", "chain mail"],
  2,
  3,
  -3,
  function(character: ADNDCharacter): ADNDCharacter {
    let skills = [
      { name: "Pick Pockets", value: 10, points: 0 },
      { name: "Detect Noise", value: 20, points: 0 },
      { name: "Climb Walls", value: 50, points: 0 },
      { name: "Read Languages", value: 5, points: 0 },
    ];
    skills = RND.shuffle(skills);

    skills = ThiefSkills.modifyForDexterity(skills, character.dexterity);
    let raceName = character.race.name;
    if (character.race.name.includes("halfling")) {
      raceName = "halfling";
    }

    skills = ThiefSkills.modifyForRace(skills, raceName);
    skills = ThiefSkills.distributePoints(skills, 20);

    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value}%`);
    }

    return character;
  },
);
