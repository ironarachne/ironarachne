import * as Directions from '$lib/geometry/directions';
import type Vertex from '$lib/geometry/vertex';
import { describe, expect, it } from 'vitest';

describe('getAngleOfLine', () => {
  it('returns cardinal angles from the origin', () => {
    const origin: Vertex = { x: 0, y: 0 };
    expect(Directions.getAngleOfLine(origin, { x: 10, y: 0 })).toBe(0);
    expect(Directions.getAngleOfLine(origin, { x: 0, y: 10 })).toBe(90);
    expect(Directions.getAngleOfLine(origin, { x: -10, y: 0 })).toBe(180);
    expect(Directions.getAngleOfLine(origin, { x: 0, y: -10 })).toBe(270);
  });

  it('handles vertical lines when delta-x is zero', () => {
    const a: Vertex = { x: 5, y: 5 };
    expect(Directions.getAngleOfLine(a, { x: 5, y: 10 })).toBe(90);
    expect(Directions.getAngleOfLine(a, { x: 5, y: 0 })).toBe(270);
  });
});

describe('getWordForVector', () => {
  it('maps diagonal and axis vectors to compass words', () => {
    expect(Directions.getWordForVector([1, 1])).toBe('northwest');
    expect(Directions.getWordForVector([1, -1])).toBe('northeast');
    expect(Directions.getWordForVector([-1, 1])).toBe('southwest');
    expect(Directions.getWordForVector([-1, -1])).toBe('southeast');
    expect(Directions.getWordForVector([0, 0])).toBe('static');
  });
});

it('should get east', () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 45, y: 0 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('east');
});

it('should get north', () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 0, y: 45 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('north');
});

it('should get west', () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: -45, y: 0 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('west');
});

it('should get south', () => {
  const a: Vertex = { x: 0, y: 0 };
  const b: Vertex = { x: 0, y: -45 };

  const direction = Directions.getDirectionFromOrigin(a, b);

  expect(direction).toBe('south');
});
