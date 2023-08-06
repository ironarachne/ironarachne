"use strict";

export default class StarshipAmmunition {
  name: string;
  classification: string; // e.g., 'missile', 'projectile', etc.
  damageType: string;
  isPowered: boolean;
  damage: number;
  velocity: number;
  cost: number;
}
