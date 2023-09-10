import * as Directions from "$lib/geometry/directions";
import type Vertex from "$lib/geometry/vertex";
import { expect, test } from "vitest";

test("should get east", () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 45, y: 0 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe("east");
});

test("should get north", () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 0, y: 45 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe("north");
});

test("should get west", () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: -45, y: 0 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe("west");
});

test("should get south", () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 0, y: -45 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe("south");
});
