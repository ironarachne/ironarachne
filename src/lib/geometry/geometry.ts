import type Edge from "./edge.js";
import type Vertex from "./vertex.js";

export function distance(a: Vertex, b: Vertex): number {
  let d = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

  return d;
}

export function edgeEquals(A: Edge, B: Edge): boolean {
  if (A.a.x == B.a.x && A.a.y == B.a.y && A.b.x == B.b.x && A.b.y == B.b.y) {
    return true;
  } else if (A.a.x == B.b.x && A.a.y == B.b.y && A.b.x == B.a.x && A.b.y == B.a.y) {
    return true;
  }

  return false;
}

export function edgesFromVertices(vertices: Vertex[]): Edge[] {
  let edges = [];

  for (let i = 0; i < vertices.length; i++) {
    let a = vertices[i];
    let b = vertices[0];
    if (i < vertices.length - 1) {
      b = vertices[i + 1];
    }
    let edge: Edge = { a, b };
    edges.push(edge);
  }

  return edges;
}

export function getMidpoint(edge: Edge): Vertex {
  let x = (edge.a.x + edge.b.x) / 2;
  let y = (edge.a.y + edge.b.y) / 2;

  return { x, y };
}

export function getSlope(edge: Edge): number {
  return (edge.b.y - edge.a.y) / (edge.b.x - edge.a.x);
}

export function vertexEquals(a: Vertex, b: Vertex): boolean {
  if (a.x == b.x && a.y == b.y) {
    return true;
  }

  return false;
}

export function vertexIn(needle: Vertex, haystack: Vertex[]): boolean {
  for (let i = 0; i < haystack.length; i++) {
    if (vertexEquals(needle, haystack[i])) {
      return true;
    }
  }

  return false;
}
