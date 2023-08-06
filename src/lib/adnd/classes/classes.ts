"use strict";

import ADNDClass from "../adndclass.js";
import abjurer from "./abjurer.js";
import bard from "./bard.js";
import cleric from "./cleric.js";
import conjurer from "./conjurer.js";
import diviner from "./diviner.js";
import druid from "./druid.js";
import enchanter from "./enchanter.js";
import fighter from "./fighter.js";
import illusionist from "./illusionist.js";
import invoker from "./invoker.js";
import mage from "./mage.js";
import necromancer from "./necromancer.js";
import paladin from "./paladin.js";
import ranger from "./ranger.js";
import thief from "./thief.js";
import transmuter from "./transmuter.js";

export function getAll(): ADNDClass[] {
  return [
    abjurer,
    bard,
    cleric,
    conjurer,
    diviner,
    druid,
    enchanter,
    fighter,
    illusionist,
    invoker,
    mage,
    necromancer,
    paladin,
    ranger,
    thief,
    transmuter,
  ];
}
