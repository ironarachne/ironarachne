import type Vertex from "$lib/geometry/vertex.js";
import type Lock from "./lock.js";

export default interface Door {
  room1: number;
  room2: number;
  tile: number;
  vertex: Vertex;
  description: string;
  lock: Lock | null;
  isSecret: boolean;
}
