"use strict";

import BeltPattern from "./clothing/belt.js";
import DressPattern from "./clothing/dress.js";
import PantsPattern from "./clothing/pants.js";
import RobePattern from "./clothing/robe.js";
import TopPattern from "./clothing/top.js";
import type Pattern from "./pattern.js";

export function all(): Pattern[] {
  return [
    new BeltPattern("belt", 1),
    new DressPattern("short dress", 2),
    new DressPattern("long dress", 2),
    new DressPattern("wedding dress", 10),
    new DressPattern("tight dress", 2),
    new DressPattern("loose dress", 3),
    new PantsPattern("trews", 1),
    new PantsPattern("pants", 1),
    new PantsPattern("brais", 1),
    new PantsPattern("breeches", 1),
    new PantsPattern("trousers", 1),
    new RobePattern("robe", 2),
    new TopPattern("shirt", 1),
    new TopPattern("short tunic", 2),
    new TopPattern("long tunic", 2),
  ];
}
