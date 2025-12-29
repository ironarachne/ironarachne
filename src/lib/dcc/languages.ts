import type { DCCLanguage } from "./dcc_types";

export function getDwarf(): DCCLanguage[] {
  return [
    { name: "Elf", commonality: 6 },
    { name: "Halfling", commonality: 10 },
    { name: "Gnome", commonality: 5 },
    { name: "Bugbear", commonality: 5 },
    { name: "Goblin", commonality: 10 },
    { name: "Gnoll", commonality: 5 },
    { name: "Hobgoblin", commonality: 5 },
    { name: "Kobold", commonality: 10 },
    { name: "Minotaur", commonality: 1 },
    { name: "Ogre", commonality: 4 },
    { name: "Orc", commonality: 4 },
    { name: "Troglodyte", commonality: 6 },
    { name: "Dragon", commonality: 2 },
    { name: "Giant", commonality: 4 },
    { name: "Bear", commonality: 2 },
    { name: "Undercommon", commonality: 2 },
  ];
}

export function getElf(): DCCLanguage[] {
  return [
    { name: "Chaos", commonality: 5 },
    { name: "Law", commonality: 5 },
    { name: "Neutrality", commonality: 5 },
    { name: "Dwarf", commonality: 4 },
    { name: "Halfling", commonality: 4 },
    { name: "Goblin", commonality: 3 },
    { name: "Gnoll", commonality: 2 },
    { name: "Harpy", commonality: 2 },
    { name: "Hobgoblin", commonality: 2 },
    { name: "Kobold", commonality: 3 },
    { name: "Lizardman", commonality: 1 },
    { name: "Minotaur", commonality: 1 },
    { name: "Ogre", commonality: 1 },
    { name: "Orc", commonality: 4 },
    { name: "Serpent-man", commonality: 1 },
    { name: "Troglodyte", commonality: 5 },
    { name: "Angelic/Celestial", commonality: 5 },
    { name: "Centaur", commonality: 5 },
    { name: "Demonic/Infernal", commonality: 5 },
    { name: "Dragon", commonality: 5 },
    { name: "Pixie", commonality: 5 },
    { name: "Naga", commonality: 3 },
    { name: "Eagle", commonality: 2 },
    { name: "Horse", commonality: 2 },
    { name: "Undercommon", commonality: 4 },
  ];
}

export function getHalfling(): DCCLanguage[] {
  return [
    { name: "Dwarf", commonality: 10 },
    { name: "Elf", commonality: 5 },
    { name: "Gnome", commonality: 10 },
    { name: "Bugbear", commonality: 5 },
    { name: "Goblin", commonality: 5 },
    { name: "Hobgoblin", commonality: 10 },
    { name: "Kobold", commonality: 10 },
    { name: "Pixie", commonality: 2 },
    { name: "Ferret", commonality: 5 },
    { name: "Undercommon", commonality: 2 },
  ];
}

export function getHuman(): DCCLanguage[] {
  return [
    { name: "Dwarf", commonality: 10 },
    { name: "Elf", commonality: 6 },
    { name: "Halfling", commonality: 5 },
    { name: "Gnome", commonality: 5 },
    { name: "Bugbear", commonality: 2 },
    { name: "Goblin", commonality: 10 },
    { name: "Gnoll", commonality: 3 },
    { name: "Hobgoblin", commonality: 6 },
    { name: "Kobold", commonality: 10 },
    { name: "Lizardman", commonality: 5 },
    { name: "Minotaur", commonality: 1 },
    { name: "Ogre", commonality: 2 },
    { name: "Orc", commonality: 10 },
    { name: "Troglodyte", commonality: 6 },
    { name: "Giant", commonality: 1 },
  ];
}
