'use strict';

import * as Directions from '../../src/modules/geometry/directions';
import Vertex from '../../src/modules/geometry/vertex';

test('should get east', () => {
  const a = new Vertex(0, 0);
  const b = new Vertex(45, 0);

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('east');
});

test('should get north', () => {
  const a = new Vertex(0, 0);
  const b = new Vertex(0, 45);

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('north');
});

test('should get west', () => {
  const a = new Vertex(0, 0);
  const b = new Vertex(-45, 0);

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('west');
});

test('should get south', () => {
  const a = new Vertex(0, 0);
  const b = new Vertex(0, -45);

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('south');
});
