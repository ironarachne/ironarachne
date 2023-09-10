import ADNDCharacter from "../adndcharacter.js";
import ADNDRace from "../adndrace.js";

export default new ADNDRace(
  "half-elf",
  "half-elven",
  function(character: ADNDCharacter): ADNDCharacter {
    character.abilities.push("30% resistance to sleep spell and all charm-related spells");
    character.abilities.push("Infravision (60')");
    character.abilities.push("Notice secret door with 1 on 1d6 when passing within 10 feet");
    character.abilities.push("Find secret door when actively searching with 1-2 on 1d6");
    character.abilities.push("Find concealed portal when actively searching with 1-3 on 1d6");
    return character;
  },
  3,
  18,
  6,
  18,
  6,
  18,
  4,
  18,
  3,
  18,
  3,
  18,
  60,
  58,
  110,
  85,
  "2d6",
  "3d12",
  15,
  12,
  "1d6",
  ["common", "elf", "gnome", "halfling", "goblin", "hobgoblin", "gnoll", "orc"],
  ["bard", "cleric", "druid", "fighter", "mage", "ranger", "specialist wizard", "thief"],
);
