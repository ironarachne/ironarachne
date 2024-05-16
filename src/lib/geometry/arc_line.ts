import type Vertex from "./vertex";

export default interface ArcLine {
  start: Vertex;
  end: Vertex;
  radius: number;
}
