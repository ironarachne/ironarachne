import ADNDCharacter from "../adndcharacter.js";
import ADNDClass from "../adndclass.js";

export default new ADNDClass(
  "paladin",
  "warrior",
  "1d10",
  12,
  -1,
  9,
  -1,
  13,
  17,
  ["strength", "charisma"],
  [
    "Detect the presence of evil intent within 60'",
    "+2 bonus to all saving throws",
    "Immune to all diseases",
    "Heal by laying on hands (2 HP), once per day",
    "Cure all dieases, once per week",
    "10' aura of protection: all summoned and specifically evil creatures within the radius suffer -1 to their attack rolls",
    "If wielding an unsheathed holy sword, project a 10' circle of power that dispels hostile magic up to the paladin's experience level",
    "May not possess more than 10 magical items",
    "Never retains wealth; all excess must be donated to the church or a worthy cause",
    "Must tithe 10% of all income to the paladin's institution",
    "May only employ lawful good henchmen",
  ],
  ["lawful good"],
  false,
  [],
  [],
  ["any"],
  ["any"],
  4,
  3,
  -2,
  function(this: ADNDClass, character: ADNDCharacter): ADNDCharacter {
    return character;
  },
);
