"use strict";

import DCCLanguage from "./language";

export function getDwarf(): DCCLanguage[] {
  return [
    new DCCLanguage("Elf", 6),
    new DCCLanguage("Halfling", 10),
    new DCCLanguage("Gnome", 5),
    new DCCLanguage("Bugbear", 5),
    new DCCLanguage("Goblin", 10),
    new DCCLanguage("Gnoll", 5),
    new DCCLanguage("Hobgoblin", 5),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 4),
    new DCCLanguage("Orc", 4),
    new DCCLanguage("Troglodyte", 6),
    new DCCLanguage("Dragon", 2),
    new DCCLanguage("Giant", 4),
    new DCCLanguage("Bear", 2),
    new DCCLanguage("Undercommon", 2),
  ];
}

export function getElf(): DCCLanguage[] {
  return [
    new DCCLanguage("Chaos", 5),
    new DCCLanguage("Law", 5),
    new DCCLanguage("Neutrality", 5),
    new DCCLanguage("Dwarf", 4),
    new DCCLanguage("Halfling", 4),
    new DCCLanguage("Goblin", 3),
    new DCCLanguage("Gnoll", 2),
    new DCCLanguage("Harpy", 2),
    new DCCLanguage("Hobgoblin", 2),
    new DCCLanguage("Kobold", 3),
    new DCCLanguage("Lizardman", 1),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 1),
    new DCCLanguage("Orc", 4),
    new DCCLanguage("Serpent-man", 1),
    new DCCLanguage("Troglodyte", 5),
    new DCCLanguage("Angelic/Celestial", 5),
    new DCCLanguage("Centaur", 5),
    new DCCLanguage("Demonic/Infernal", 5),
    new DCCLanguage("Dragon", 5),
    new DCCLanguage("Pixie", 5),
    new DCCLanguage("Naga", 3),
    new DCCLanguage("Eagle", 2),
    new DCCLanguage("Horse", 2),
    new DCCLanguage("Undercommon", 4),
  ];
}

export function getHalfling(): DCCLanguage[] {
  return [
    new DCCLanguage("Dwarf", 10),
    new DCCLanguage("Elf", 5),
    new DCCLanguage("Gnome", 10),
    new DCCLanguage("Bugbear", 5),
    new DCCLanguage("Goblin", 5),
    new DCCLanguage("Hobgoblin", 10),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Pixie", 2),
    new DCCLanguage("Ferret", 5),
    new DCCLanguage("Undercommon", 2),
  ];
}

export function getHuman(): DCCLanguage[] {
  return [
    new DCCLanguage("Dwarf", 10),
    new DCCLanguage("Elf", 6),
    new DCCLanguage("Halfling", 5),
    new DCCLanguage("Gnome", 5),
    new DCCLanguage("Bugbear", 2),
    new DCCLanguage("Goblin", 10),
    new DCCLanguage("Gnoll", 3),
    new DCCLanguage("Hobgoblin", 6),
    new DCCLanguage("Kobold", 10),
    new DCCLanguage("Lizardman", 5),
    new DCCLanguage("Minotaur", 1),
    new DCCLanguage("Ogre", 2),
    new DCCLanguage("Orc", 10),
    new DCCLanguage("Troglodyte", 6),
    new DCCLanguage("Giant", 1),
  ];
}
