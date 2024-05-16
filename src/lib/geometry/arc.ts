import type Vertex from "./vertex";

export default interface Arc {
  center: Vertex;
  radius: number;
  startAngle: number;
  endAngle: number;
}
