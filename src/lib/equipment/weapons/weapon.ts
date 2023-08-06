"use strict";

import type Item from "../item.js";

export default interface Weapon extends Item {
  damage: string;
  hands: number;
}
