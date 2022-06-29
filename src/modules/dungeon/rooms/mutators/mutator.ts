'use strict';

import Room from '../room';

export default class Mutator {
  name: string;
  mutate: (room: Room) => Room;
  tags: string[];

  constructor(name: string, mutate: (room: Room) => Room, tags: string[]) {
    this.name = name;
    this.mutate = mutate;
    this.tags = tags;
  }
}
