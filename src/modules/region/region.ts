'use strict';

import Character from '../characters/character';
import Environment from '../environment/environment';
import Organization from '../organizations/organization';
import Realm from '../realms/realm';
import Settlement from '../settlements/settlement';

export default class Region {
  name: string;
  environment: Environment;
  description: string;
  settlements: Settlement[];
  mainRealm: number;
  realms: Realm[];
  authority: Character;
  organizations: Organization[];
  settlementTiles: number[][];
  terrainTiles: number[][];

  constructor() {
    this.name = '';
    this.description = '';
    this.mainRealm = -1;
    this.realms = [];
    this.settlements = [];
    this.organizations = [];
  }
}
