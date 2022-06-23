'use strict';

export default class Lock {
  id: string;
  name: string;
  description: string;
  objectId: number; // numeric id of the thing that this locks
  strength: number;
  isLocked: boolean;

  constructor() {
    this.id = '';
    this.name = 'a lock';
    this.description = 'a lock';
    this.objectId = -1;
    this.strength = 1;
    this.isLocked = true;
  }
}
