import * as RND from "@ironarachne/rng";
import ADNDCharacter from "../adndcharacter.js";
import ADNDClass from "../adndclass.js";
import SpellFilter from "../spellfilter.js";
import * as Spells from "../spells.js";

export default new ADNDClass(
  "cleric",
  "priest",
  "1d8",
  -1,
  -1,
  -1,
  -1,
  9,
  -1,
  ["wisdom"],
  ["Cast priest spells", "Turn undead"],
  [
    "lawful good",
    "lawful neutral",
    "lawful evil",
    "neutral good",
    "true neutral",
    "neutral evil",
    "chaotic evil",
    "chaotic neutral",
    "chaotic good",
  ],
  true,
  ["priest"],
  [
    {
      filter: new SpellFilter("", 1, "priest", [], ["plant", "animal", "weather", "elemental"]),
      count: 1,
    },
  ],
  ["bludgeoning"],
  ["any"],
  2,
  4,
  -3,
  function(this: ADNDClass, character: ADNDCharacter): ADNDCharacter {
    let allSpells = Spells.getAll();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = Spells.getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        let filteredSpell = filteredSpells.pop();
        if (filteredSpell === undefined) {
          throw new Error("Spell is undefined.");
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  },
);
