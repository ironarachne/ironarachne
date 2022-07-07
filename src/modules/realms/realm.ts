'use strict';

import Character from '../characters/character';
import Title from '../characters/title';
import Vertex from '../geometry/vertex';
import Arms from '../heraldry/arms';
import Claim from './claim';
import RealmType from './realmtype';

export default class Realm {
  name: string;
  adjective: string;
  description: string;
  heraldry: Arms; // TODO: use an abstract representation of imagery, so we can optionally do mon or flags instead of heraldry
  authority: Character;
  grantedTitle: Title;
  tiles: Vertex[];
  claims: Claim[];
  parent: number; // array index of the parent realm
  realmType: RealmType;

  constructor() {
    this.name = '';
    this.adjective = '';
    this.description = '';
    this.tiles = [];
    this.claims = [];
    this.parent = -1;
  }
}
