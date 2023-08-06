"use strict";

export default class StarshipWeaponMount {
  name: string;
  grade: number;
  mountType: string; // e.g., 'turret', 'fixed'
  fireArc: number; // in degrees; only matters for turret weapons
  facing: string; // e.g., 'fore', 'aft', etc.
  cost: number;
}
