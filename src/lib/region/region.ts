"use strict";

import Character from "../characters/character.js";
import Culture from "../culture/culture.js";
import Environment from "../environment/environment.js";
import Organization from "../organizations/organization.js";
import Realm from "../realms/realm.js";
import Settlement from "../settlements/settlement.js";

export default class Region {
  name: string;
  environment: Environment;
  description: string;
  dominantCulture: Culture;
  settlements: Settlement[];
  mainRealm: number;
  realms: Realm[];
  authority: Character;
  organizations: Organization[];
  settlementTiles: number[][];
  terrainTiles: number[][];

  constructor() {
    this.name = "";
    this.description = "";
    this.mainRealm = -1;
    this.realms = [];
    this.settlements = [];
    this.organizations = [];
  }
}
