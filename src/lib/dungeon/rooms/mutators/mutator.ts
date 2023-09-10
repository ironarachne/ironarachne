import type Room from "../room.js";

export default class RoomMutator {
  name: string;
  mutate: (room: Room) => Room;
  tags: string[];

  constructor(name: string, mutate: (room: Room) => Room, tags: string[]) {
    this.name = name;
    this.mutate = mutate;
    this.tags = tags;
  }
}
