"use strict";

import DungeonTheme from "../dungeontheme.js";
import * as Cult from "./cult.js";
import * as Fortress from "./fortress.js";
import * as MageLair from "./magelair.js";
import * as Tomb from "./tomb.js";

export function all(): DungeonTheme[] {
  let result = [];

  result.push(Cult.getTheme());
  result.push(Fortress.getTheme());
  result.push(MageLair.getTheme());
  result.push(Tomb.getTheme());

  return result;
}
