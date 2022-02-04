'use strict';

import Character from '../character';

export default class FamilyMember {
  id: number;
  character: Character;
  children: number[];
  parents: number[];
  mate: number;

  constructor(id: number) {
    this.id = id;
    this.children = [];
    this.parents = [];
    this.mate = -1;
  }
}
